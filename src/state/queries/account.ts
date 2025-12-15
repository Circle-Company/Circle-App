import { useQuery, UseQueryResult } from "@tanstack/react-query"
import api from "../../services/Api"

/**
 * Account Data Types
 */

/**
 * Represents the authenticated user's account data
 */
export type AccountData = {
    id: string
    username: string
    name: string
    description: string
    profilePicture: string | null
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

/**
 * Represents a single moment (video post) from the account
 */
export type AccountMoment = {
    id: string
    description: string | null
    video: {
        url: string
    }
    thumbnail: {
        url: string
        width: number
        height: number
    }
    publishedAt: string
}

/**
 * Response structure for account moments with pagination
 */
export type AccountMomentsResponse = {
    moments: AccountMoment[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

/**
 * Query Keys
 * Use these keys to invalidate or refetch specific queries
 * @example
 * // Invalidate all account queries
 * queryClient.invalidateQueries({ queryKey: accountKeys.all })
 *
 * // Invalidate only account detail
 * queryClient.invalidateQueries({ queryKey: accountKeys.detail() })
 */
export const accountKeys = {
    all: ["account"] as const,
    detail: () => [...accountKeys.all, "detail"] as const,
    moments: () => [...accountKeys.all, "moments"] as const,
    momentsPaginated: (page: number, limit: number) =>
        [...accountKeys.moments(), { page, limit }] as const,
}

/**
 * API Functions
 * These functions handle the actual API calls
 */

/**
 * Fetches the authenticated user's account data
 * @param token - JWT token for authentication
 * @returns Promise resolving to AccountData
 * @throws Error if the API request fails
 */
async function fetchAccount(token: string): Promise<AccountData> {
    const authHeader = token?.startsWith("Bearer ") ? token : `Bearer ${token}`
    const response = await api.get("/account", {
        headers: {
            Authorization: authHeader,
        },
    })
    return response.data.account
}

/**
 * Fetches moments (video posts) for the authenticated user's account
 * @param token - JWT token for authentication
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
    const authHeader = token?.startsWith("Bearer ") ? token : `Bearer ${token}`
    const response = await api.get(`/account/moments?page=${page}&limit=${limit}`, {
        headers: {
            Authorization: authHeader,
        },
    })
    return response.data
}

/**
 * React Query Hooks
 */

/**
 * Hook to fetch and cache the authenticated user's account data
 *
 * @param token - JWT token for authentication
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
 * Hook to fetch and cache the authenticated user's moments with pagination
 *
 * @param token - JWT token for authentication
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
