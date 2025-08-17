import { apiRoutes } from "@/services/Api"
import { useMutation } from "@tanstack/react-query"

type useSendCommentMutationProps = {
    userId: string
    momentId: string
    comment: string
    authorizationToken: string
}

export function useSendCommentMutation({ momentId, userId, authorizationToken }: useSendCommentMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.moment.comment({
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