import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "../../services/Api"

type useLikeMutationProps = {
    userId: number
    momentId: number
}

export function useLikeMutation({ momentId, userId }: useLikeMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.moment.like({
                userId,
                momentId,
            })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useUnlikeMutation({ momentId, userId }: useLikeMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.moment.deleteLike({
                userId,
                momentId,
            })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
