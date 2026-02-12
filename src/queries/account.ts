import { useQuery, UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query"
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
    video: { url: string }
    thumbnail: {
        url: string
        width: number
        height: number
    }
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
 * @returns Promise resolving to AccountData
 * @throws Error if the API request fails
 */
async function fetchAccount(): Promise<AccountData> {
    const response = await apiRoutes.account.getAccount()
    return response.account
}

/**
 * Fetches moments (video posts) for the authenticated user's account.
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 20)
 * @returns Promise resolving to AccountMomentsResponse with moments and pagination info
 * @throws Error if the API request fails
 */
export async function fetchAccountMoments(
    page: number = 1,
    limit: number = 20,
): Promise<AccountMomentsResponse> {
    const response = await apiRoutes.account.getMoments({ page, limit })
    return {
        moments: response.moments as any as AccountMoment[],
        pagination: response.pagination,
    }
}

/**
 * React Query Hooks
 */

/**
 * Hook to fetch and cache the authenticated user's account data.
 *
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
 * const { data, isLoading, refetch } = useAccountQuery({
 *   enabled: !!session.account.jwtToken,
 *   staleTime: 1000 * 60 * 10, // 10 minutes
 * })
 *
 * if (isLoading) return <Loading />
 * return <Profile user={data} />
 * ```
 */
export function useAccountQuery(options?: {
    enabled?: boolean
    refetchOnMount?: boolean
    staleTime?: number
}): UseQueryResult<AccountData, Error> {
    return useQuery({
        queryKey: accountKeys.detail(),
        queryFn: () => fetchAccount(),
        staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default
        enabled: options?.enabled ?? true,
        refetchOnMount: options?.refetchOnMount ?? true,
    })
}

/**
 * Hook to fetch and cache the authenticated user's moments with pagination.
 *
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
        queryFn: () => fetchAccountMoments(page, limit),
        staleTime: options?.staleTime ?? 1000 * 60 * 2, // 2 minutes default
        enabled: options?.enabled ?? true,
        refetchOnMount: options?.refetchOnMount ?? true,
    })
}

/**
 * Mutation: update account description
 */
type UpdateAccountDescriptionInput = {
    description: string | null
}

type UpdateAccountNameInput = {
    name: string | null
}

export type UpdateAccountCoordinatesInput = {
    lat: string
    lng: string
}

async function updateAccountDescription(input: UpdateAccountDescriptionInput): Promise<void> {
    // Backend route expected to update the description for the authenticated account
    await apiRoutes.account.updateDescription({
        description: input.description,
    } as any)
}

async function updateAccountName(input: UpdateAccountNameInput): Promise<void> {
    // Backend route expected to update the name for the authenticated account
    await apiRoutes.account.updateName({
        name: input.name,
    } as any)
}

export async function updateAccountCoordinates(
    input: UpdateAccountCoordinatesInput,
): Promise<void> {
    await apiRoutes.account.updateCoordinates({
        lat: input.lat,
        lng: input.lng,
    } as any)
}

/**
 * Hook to update the authenticated user's description and invalidate cached account detail.
 */
export function useUpdateAccDescMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateAccountDescription,
        onSuccess: async () => {
            // Refresh account detail after successful update
            await queryClient.invalidateQueries({ queryKey: accountKeys.detail() })
            await queryClient.refetchQueries({ queryKey: accountKeys.detail() })
        },
    })
}

export function useUpdateAccNameMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateAccountName,
        onSuccess: async () => {
            // Refresh account detail after successful update
            await queryClient.invalidateQueries({ queryKey: accountKeys.detail() })
            await queryClient.refetchQueries({ queryKey: accountKeys.detail() })
        },
    })
}

export function useUpdateAccCoordsMutation() {
    return useMutation({
        mutationFn: updateAccountCoordinates,
    })
}
