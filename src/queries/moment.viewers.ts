import {
    useInfiniteQuery,
    type UseInfiniteQueryResult,
    type InfiniteData,
} from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import { STALE } from "./index"
import type {
    MomentViewer,
    MomentViewersResponse,
    MomentViewsStats,
} from "@/api/moment/moment.types"

export type { MomentViewer, MomentViewersResponse, MomentViewsStats }

export { flattenViewers, latestStats } from "./moment.viewers.helpers"

export const PAGE_SIZE = 30

export const momentViewersKeys = {
    all: ["moment", "viewers"] as const,
    byMoment: (momentId: string) => [...momentViewersKeys.all, momentId] as const,
}

export type MomentViewersError = Error & {
    /** `code` do envelope de erro do backend: FORBIDDEN, NOT_FOUND, etc. */
    code?: string
    status?: number
}

function toViewersError(error: any): MomentViewersError {
    const err = new Error(
        error?.response?.data?.error || error?.message || "Failed to load viewers",
    ) as MomentViewersError
    err.code = error?.response?.data?.code
    err.status = error?.response?.status
    return err
}

/**
 * Lista paginada de quem viu o moment. **Só o dono pode ler** — para qualquer
 * outra pessoa o backend responde 403 (`FORBIDDEN`), então habilite a query
 * apenas quando o moment for da conta logada.
 *
 * A paginação é por `offset` e novas views chegam durante a navegação, o que
 * pode repetir alguém que subiu para o topo; por isso deduplicamos por `userId`
 * ao achatar as páginas, e o pull-to-refresh recarrega do zero.
 */
export function useMomentViewersQuery(
    momentId: string,
    options?: { enabled?: boolean; limit?: number; staleTime?: number },
): UseInfiniteQueryResult<InfiniteData<MomentViewersResponse>, MomentViewersError> {
    const limit = options?.limit ?? PAGE_SIZE

    return useInfiniteQuery({
        queryKey: momentViewersKeys.byMoment(String(momentId)),
        initialPageParam: 0,
        queryFn: async ({ pageParam }) => {
            try {
                return await apiRoutes.moment.viewers.getViewers({
                    momentId: String(momentId),
                    limit,
                    offset: pageParam as number,
                })
            } catch (error: any) {
                throw toViewersError(error)
            }
        },
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((acc, page) => acc + page.viewers.length, 0)
            if (lastPage.viewers.length < limit) return undefined
            if (loaded >= lastPage.total) return undefined
            return loaded
        },
        enabled: (options?.enabled ?? true) && !!momentId,
        staleTime: options?.staleTime ?? STALE.SECONDS.THIRTY,
        retry: false,
    })
}
