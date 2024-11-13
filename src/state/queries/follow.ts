import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "../../services/Api"

type useFollowMutationProps = {
    userId: number
    followedUserId: number
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
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
