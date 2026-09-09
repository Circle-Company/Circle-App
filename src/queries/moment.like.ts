import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import { trackUserAction } from "@/lib/trackEvent"

type useLikeMutationProps = {
    userId: string
    momentId: string
    authorizationToken: string
}

export function useLikeMutation({ momentId, userId, authorizationToken }: useLikeMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.moment.like({
                userId,
                authorizationToken,
                momentId,
            })
        },
        onSuccess: () => {
            trackUserAction("moment_liked", { moment_id: momentId })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useUnlikeMutation({ momentId, userId, authorizationToken }: useLikeMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.moment.unlike({
                userId,
                authorizationToken,
                momentId,
            })
        },
        onSuccess: () => {
            trackUserAction("moment_unliked", { moment_id: momentId })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
