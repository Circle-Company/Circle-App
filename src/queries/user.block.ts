import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import { trackUserAction } from "@/lib/trackEvent"

type useBlockMutationProps = {
    userId: string
}

export function useBlockMutation({ userId }: useBlockMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.profile.postBlock({
                blockedUserId: userId,
            })
        },
        onSuccess: () => {
            trackUserAction("user_blocked", { target_user_id: userId })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useUnlockMutation({ userId }: useBlockMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.profile.deleteBlock({
                unlockedUserId: userId,
            })
        },
        onSuccess: () => {
            trackUserAction("user_unblocked", { target_user_id: userId })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
