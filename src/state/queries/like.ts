import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "../../services/Api"

type useLikeMutationProps = {
    userId: number
    momentId: number
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
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
