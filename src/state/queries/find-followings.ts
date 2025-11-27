import { apiRoutes } from "../../services/Api"
import { useInfiniteQuery } from "@tanstack/react-query"

type Follower = {
    id: string
    username: string
    verified: boolean
    profile_picture: { tiny_resolution: null | string }
    statistic: { total_followers_num: number }
    followed_at: string
}

type FollowingsResponse = {
    items: Follower[]
    nextPage?: number
}

type UseFindAccountFollowingsQueryParams = {
    initialPageParam?: number
    customQueryKey?: string[]
    limit?: number
}

export function useFindAccountFollowingsQuery({
    initialPageParam = 1,
    customQueryKey = ["find-account-followings"],
    limit = 10,
}: UseFindAccountFollowingsQueryParams = {}) {
    return useInfiniteQuery<FollowingsResponse, Error>({
        queryKey: [...customQueryKey, { limit }],
        queryFn: async ({ pageParam = initialPageParam }): Promise<FollowingsResponse> => {
            const response: any = await apiRoutes.account.findFollowings({ page: pageParam, limit })
            return response.data
        },
        getNextPageParam: (lastPage: FollowingsResponse) => lastPage?.nextPage || undefined,
        initialPageParam,
    })
}
