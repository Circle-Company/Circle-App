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
