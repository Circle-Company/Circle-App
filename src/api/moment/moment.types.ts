export interface BaseAction {
    momentId: string
}

export interface watchTimeAction extends BaseAction {
    watchTime: number
}

export interface reportAction {
    momentId: string
    reason: string
    description: string
}

export interface commentAction extends BaseAction {
    content: string
    mentions: string[]
    parentId: string
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /moments/:id — contrato documentado em `docs/get-moment.md`
//
// Duas armadilhas do payload moldam tudo o que vem abaixo:
//   1. ausência chega como **string vazia**, nunca `null` (o mapper do backend usa `|| ""`)
//   2. `topComment` ausente é uma **chave omitida**, não `null` (`JSON.stringify` some com
//      `undefined`)
// Por isso a normalização acontece na borda: a UI nunca deve ver `""` nem chave faltando.
// ─────────────────────────────────────────────────────────────────────────────

/** Hoje só `video` e `image`, mas trate como aberto — ver §4 do contrato. */
export type MomentContentType = "video" | "image"

export interface RawTopComment {
    id: string
    content: string
    richContent: string
    user: {
        id: string
        username: string
        profilePicture: string
    }
    sentiment: string
    createdAt: string
}

/** Payload cru, exatamente como vem da API. */
export interface RawMoment {
    id: string
    contentType: string
    media: string
    thumbnail: string
    duration: number
    size: number
    hasAudio: boolean
    ageRestriction: boolean
    contentWarning: boolean
    metrics: {
        totalViews: number
        totalLikes: number
        totalComments: number
    }
    publishedAt: string
    topComment?: RawTopComment
}

export interface GetMomentResponse {
    success: boolean
    moment?: RawMoment
    error?: string
    code?: string
}

export interface TopComment {
    id: string
    /** Texto puro, como o autor digitou. Use em preview, notificação e acessibilidade. */
    content: string
    /** Mesmo texto com menções já resolvidas para ids (formato `circle-text-library`). */
    richContent: string
    user: {
        id: string
        username: string | null
        profilePicture: string | null
    }
    sentiment: "positive" | "neutral" | "negative"
    createdAt: Date
}

/** Modelo usado pela UI: ausência é sempre `null`, datas são `Date`. */
export interface MomentDetail {
    id: string
    contentType: MomentContentType
    media: string | null
    thumbnail: string | null
    duration: number
    size: number
    hasAudio: boolean
    ageRestriction: boolean
    contentWarning: boolean
    metrics: {
        views: number
        likes: number
        comments: number
    }
    publishedAt: Date
    topComment: TopComment | null
}

/**
 * `not-found` e `forbidden` são **definitivos**; `unknown` é transitório.
 *
 * A distinção importa porque o backend responde `400` para os três (§6/§7.4): um retry
 * baseado no status tentaria de novo, para sempre, um momento que não existe.
 */
export type MomentErrorKind = "unauthenticated" | "not-found" | "forbidden" | "unknown"

/** `GET /moments/:id/viewers` — parâmetros de paginação (limit tem teto 100). */
export interface getViewersParams {
    momentId: string
    limit?: number
    offset?: number
}

/**
 * Uma linha da lista de visualizadores. Perfil ausente não some da lista: vem
 * com `username`/`name`/`profilePictureUrl` nulos, mantendo o registro da view.
 */
export interface MomentViewer {
    userId: string
    username: string | null
    name: string | null
    profilePictureUrl: string | null
    /** ISO 8601 — a visualização MAIS RECENTE desta pessoa. */
    lastViewedAt: string
    /** Quantas vezes essa pessoa viu (≥ 1). Não há deduplicação no servidor. */
    viewCount: number
    hasCompleted: boolean
    /** Estado ATUAL do like, não "curtiu enquanto via". */
    hasLiked: boolean
}

export interface MomentViewsStats {
    totalViews: number
    uniqueViewers: number
    completedViews: number
    /** `null` quando nenhuma view informou duração. */
    averageWatchSeconds: number | null
    lastViewedAt: string | null
}

export interface MomentViewersResponse {
    success: boolean
    viewers: MomentViewer[]
    /** Visualizadores distintos — é o número que pagina. */
    total: number
    stats: MomentViewsStats
}
