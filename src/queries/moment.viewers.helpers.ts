import type { InfiniteData } from "@tanstack/react-query"
import type {
    MomentViewer,
    MomentViewersResponse,
    MomentViewsStats,
} from "@/api/moment/moment.types"

/**
 * Achata as páginas em uma lista única, sem repetir quem subiu para o topo.
 * A paginação é por `offset` e novas views chegam durante a navegação, então a
 * página seguinte pode devolver de novo alguém que já apareceu.
 */
export function flattenViewers(data?: InfiniteData<MomentViewersResponse>): MomentViewer[] {
    if (!data) return []
    const seen = new Set<string>()
    const viewers: MomentViewer[] = []
    for (const page of data.pages) {
        for (const viewer of page.viewers) {
            const id = String(viewer.userId)
            if (seen.has(id)) continue
            seen.add(id)
            viewers.push(viewer)
        }
    }
    return viewers
}

/** Os números do cabeçalho vêm sempre da página mais recente que chegou. */
export function latestStats(data?: InfiniteData<MomentViewersResponse>): MomentViewsStats | null {
    if (!data || data.pages.length === 0) return null
    return data.pages[data.pages.length - 1].stats
}
