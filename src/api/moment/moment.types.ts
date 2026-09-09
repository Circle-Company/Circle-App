export interface BaseAction {
    momentId: string
    authorizationToken: string
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
    mentions: Array<string>
    parentId: string
}

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
