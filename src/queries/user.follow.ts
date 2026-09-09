import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import { trackUserAction } from "@/lib/trackEvent"

type useFollowMutationProps = {
    userId: string
    followedUserId: string
    authorizationToken: string
}

export function useFollowMutation({ followedUserId, userId }: useFollowMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.user.follow({
                userId,
                followedUserId,
            })
        },
        onSuccess: () => {
            trackUserAction("user_followed", { target_user_id: followedUserId })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useUnfollowMutation({ followedUserId, userId }: useFollowMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.user.unfollow({
                userId,
                followedUserId,
            })
        },
        onSuccess: () => {
            trackUserAction("user_unfollowed", { target_user_id: followedUserId })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
