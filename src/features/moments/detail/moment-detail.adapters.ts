import type { MomentDetail } from "@/api/moment/moment.types"
import type { CommentObject } from "@/components/comment/comments-types"
import type { dataProps } from "@/components/moment/context/types"
import { asBoolean, asNumber, asString, isObject } from "@/contexts/Persisted/coerce"

/**
 * Fronteira entre o modelo normalizado de `GET /moments/:id` (`MomentDetail`) e o contrato
 * que o `MomentContext` consome (`dataProps`).
 *
 * As duas telas de detalhe — `/moment/[id]` e `/profile/moment/[momentId]` — faziam essa
 * conversão cada uma do seu jeito, e as diferenças não eram intencionais: uma lia `media`
 * do formato atual e a outra só dos legados, uma normalizava `topComment` e a outra
 * repassava cru. Com uma cópia só, uma correção vale para as duas.
 */

type MomentUser = dataProps["user"]

/**
 * `GET /moments/:id` **não devolve o dono do moment** (§2.1 do contrato): nem id, nem
 * username, nem avatar. Não há como derivar da resposta — o autor vem de quem já o tinha:
 * o item da lista de onde a navegação partiu e, quando ele não traz, o perfil sendo
 * visitado.
 */
export function pickMomentUser(raw: unknown, fallback?: unknown): MomentUser {
    const source = isObject(raw) && isObject(raw.user) ? raw.user : {}
    const alt = isObject(fallback) ? fallback : {}

    return {
        id: asString(source.id) || asString(alt.id),
        username: asString(source.username) || asString(alt.username),
        profilePicture: asString(source.profilePicture) || asString(alt.profilePicture),
        verified: asBoolean(source.verified) || asBoolean(alt.verified),
        youFollow: asBoolean(source.youFollow) || asBoolean(alt.youFollow),
        followYou: asBoolean(source.followYou) || asBoolean(alt.followYou),
    }
}

/**
 * Converte o modelo normalizado no contrato do `MomentContext`.
 *
 * `media`/`thumbnail` voltam a `""` porque é o que o `dataProps` declara; o `null` da borda
 * serviu para a decisão de "indisponível" acontecer **uma vez**, no `useMomentDetail`, e
 * não espalhada pela UI.
 */
export function toMomentData(
    detail: MomentDetail,
    user: MomentUser,
    extras?: { isLiked?: boolean },
): dataProps {
    return {
        id: detail.id,
        user,
        media: detail.media ?? "",
        thumbnail: detail.thumbnail ?? "",
        duration: detail.duration,
        // `dataProps.size` é string por histórico do contexto; o payload manda bytes.
        size: String(detail.size),
        hasAudio: detail.hasAudio,
        ageRestriction: detail.ageRestriction,
        contentWarning: detail.contentWarning,
        metrics: {
            totalViews: detail.metrics.views,
            totalLikes: detail.metrics.likes,
            totalComments: detail.metrics.comments,
        },
        topComment: detail.topComment
            ? ({
                  id: detail.topComment.id,
                  content: detail.topComment.content,
                  richContent: detail.topComment.richContent,
                  user: {
                      id: detail.topComment.user.id,
                      username: detail.topComment.user.username ?? "",
                      profilePicture: detail.topComment.user.profilePicture ?? "",
                  },
                  sentiment: detail.topComment.sentiment,
                  createdAt: detail.topComment.createdAt.toISOString(),
              } satisfies CommentObject)
            : undefined,
        publishedAt: Number.isNaN(detail.publishedAt.getTime())
            ? ""
            : detail.publishedAt.toISOString(),
        isLiked: extras?.isLiked ?? false,
    }
}

/**
 * O backend já entregou um momento em três formas ao longo do tempo, e as três ainda chegam
 * às telas de detalhe: a atual (`media`/`thumbnail`), a das listas do account (`video.url` /
 * `thumbnail.url`) e a legada (`midia.fullhd_resolution`). A ordem começa pelo formato
 * atual: quando ele existe, ganha.
 *
 * Uma versão anterior desta leitura começava pelos legados. Com o payload atual `media`
 * saía `undefined` e o player nunca recebia fonte — o card ficava parado na thumbnail.
 */
function pickMedia(item: Record<string, any>): { media: string; thumbnail: string } {
    return {
        media:
            asString(item.media) ||
            asString(item.video?.url) ||
            asString(item.midia?.fullhd_resolution) ||
            asString(item.midia?.nhd_resolution),
        thumbnail:
            (typeof item.thumbnail === "string"
                ? asString(item.thumbnail)
                : asString(item.thumbnail?.url)) || asString(item.midia?.nhd_thumbnail),
    }
}

/**
 * Adapta um item de lista (feed, account, profile) ao modelo normalizado, para servir de
 * semente síncrona ao React Query — ver `useMomentDetail`.
 */
export function seedFromListItem(raw: unknown): MomentDetail | null {
    if (!isObject(raw)) return null

    const item = raw as Record<string, any>
    const id = asString(item.id) || (item.id != null ? String(item.id) : "")
    if (!id) return null

    const { media, thumbnail } = pickMedia(item)
    const metrics = isObject(item.metrics) ? item.metrics : {}
    const top = isObject(item.topComment) ? (item.topComment as Record<string, any>) : null

    return {
        id,
        contentType: item.contentType === "image" ? "image" : "video",
        media: media || null,
        thumbnail: thumbnail || null,
        duration: asNumber(item.duration ?? item.video?.duration ?? item.midia?.duration),
        size: asNumber(item.size ?? item.video?.size),
        // Único campo que não segue "ausente = falso": o `Moment.AudioControl` some quando
        // `hasAudio === false`, e uma semente sem o campo não pode esconder o botão de som.
        hasAudio: item.hasAudio !== false,
        ageRestriction: asBoolean(item.ageRestriction),
        contentWarning: asBoolean(item.contentWarning),
        metrics: {
            views: asNumber(metrics.totalViews),
            likes: asNumber(metrics.totalLikes),
            comments: asNumber(metrics.totalComments),
        },
        publishedAt: new Date(asString(item.publishedAt) || asString(item.created_at) || 0),
        topComment: top
            ? {
                  id: asString(top.id),
                  content: asString(top.content),
                  richContent: asString(top.richContent) || asString(top.content),
                  user: {
                      id: asString(top.user?.id),
                      username: asString(top.user?.username) || null,
                      profilePicture: asString(top.user?.profilePicture) || null,
                  },
                  sentiment:
                      top.sentiment === "positive" || top.sentiment === "negative"
                          ? top.sentiment
                          : "neutral",
                  createdAt: new Date(asString(top.createdAt) || 0),
              }
            : null,
    }
}
