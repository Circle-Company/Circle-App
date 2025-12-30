import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { apiRoutes } from "@/api"

export type AccountData = {
    id: string
    username: string
    name: string
    description: string
    profilePicture: string
    status: {
        verified: boolean
    }
    metrics: {
        totalFollowers: number
        totalFollowing: number
        totalLikesReceived: number
        totalViewsReceived: number
        engagementGrowthRate30d: number
        followerGrowthRate30d: number
        interactionsGrowthRate30d: number
    }
}
export type AccountMoment = {
    id: string
    description: string | null
    media: string
    thumbnail: string
    publishedAt: string
}
export type AccountMomentsResponse = {
    moments: AccountMoment[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export const accountKeys = {
    all: ["account"] as const,
    detail: () => [...accountKeys.all, "detail"] as const,
    moments: () => [...accountKeys.all, "moments"] as const,
    momentsPaginated: (page: number, limit: number) =>
        [...accountKeys.moments(), { page, limit }] as const,
}

/**
 * Fetches the authenticated user's account data.
 * Note: Authentication headers are injected by the account routes service.
 * The 'token' parameter is kept for API compatibility and query enabling only.
 * @param token - Unused for headers (kept for compatibility/enabling)
 * @returns Promise resolving to AccountData
 * @throws Error if the API request fails
 */
async function fetchAccount(token: string): Promise<AccountData> {
    const response = await apiRoutes.account.getAccount()
    return response.account
}

/**
 * Fetches moments (video posts) for the authenticated user's account.
 * Note: Authentication headers are injected by the account routes service.
 * The 'token' parameter is kept for API compatibility and query enabling only.
 * @param token - Unused for headers (kept for compatibility/enabling)
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 20)
 * @returns Promise resolving to AccountMomentsResponse with moments and pagination info
 * @throws Error if the API request fails
 */
async function fetchAccountMoments(
    token: string,
    page: number = 1,
    limit: number = 20,
): Promise<AccountMomentsResponse> {
    const response = await apiRoutes.account.getMoments({ page, limit })
    return {
        moments: response.moments,
        pagination: response.pagination,
    }
}

/**
 * React Query Hooks
 */

/**
 * Hook to fetch and cache the authenticated user's account data.
 *
 * @param token - Value used only to control query enabling; headers are managed by the routes service
 * @param options - Query configuration options
 * @param options.enabled - Whether the query should run (default: true)
 * @param options.refetchOnMount - Whether to refetch when component mounts (default: true)
 * @param options.staleTime - Time in ms before data is considered stale (default: 5 minutes)
 *
 * @returns UseQueryResult with account data, loading states, and refetch function
 *
 * @example
 * ```tsx
 * const { session } = useContext(PersistedContext)
 * const { data, isLoading, refetch } = useAccountQuery(session.account.jwtToken, {
 *   enabled: !!session.account.jwtToken,
 *   staleTime: 1000 * 60 * 10, // 10 minutes
 * })
 *
 * if (isLoading) return <Loading />
 * return <Profile user={data} />
 * ```
 */
export function useAccountQuery(
    token: string,
    options?: {
        enabled?: boolean
        refetchOnMount?: boolean
        staleTime?: number
    },
): UseQueryResult<AccountData, Error> {
    return useQuery({
        queryKey: accountKeys.detail(),
        queryFn: () => fetchAccount(token),
        staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default
        enabled: options?.enabled ?? true,
        refetchOnMount: options?.refetchOnMount ?? true,
    })
}

/**
 * Hook to fetch and cache the authenticated user's moments with pagination.
 *
 * @param token - Value used only to control query enabling; headers are managed by the routes service
 * @param page - Page number to fetch (default: 1)
 * @param limit - Number of moments per page (default: 20)
 * @param options - Query configuration options
 * @param options.enabled - Whether the query should run (default: true)
 * @param options.refetchOnMount - Whether to refetch when component mounts (default: true)
 * @param options.staleTime - Time in ms before data is considered stale (default: 2 minutes)
 *
 * @returns UseQueryResult with moments data, pagination info, loading states, and refetch function
 *
 * @example
 * ```tsx
 * const { session } = useContext(PersistedContext)
 * const [page, setPage] = useState(1)
 * const { data, isLoading } = useAccountMomentsQuery(session.account.jwtToken, page, 20)
 *
 * const loadMore = () => {
 *   if (data && data.pagination.page < data.pagination.totalPages) {
 *     setPage(prev => prev + 1)
 *   }
 * }
 *
 * return (
 *   <FlatList
 *     data={data?.moments}
 *     onEndReached={loadMore}
 *   />
 * )
 * ```
 */
export function useAccountMomentsQuery(
    token: string,
    page: number = 1,
    limit: number = 20,
    options?: {
        enabled?: boolean
        refetchOnMount?: boolean
        staleTime?: number
    },
): UseQueryResult<AccountMomentsResponse, Error> {
    return useQuery({
        queryKey: accountKeys.momentsPaginated(page, limit),
        queryFn: () => fetchAccountMoments(token, page, limit),
        staleTime: options?.staleTime ?? 1000 * 60 * 2, // 2 minutes default
        enabled: options?.enabled ?? true,
        refetchOnMount: options?.refetchOnMount ?? true,
    })
}
