import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import { trackUserAction } from "@/lib/trackEvent"

type useSendCommentMutationProps = {
    userId: string
    momentId: string
    comment: string
    authorizationToken: string
}

export function useSendCommentMutation({
    momentId,
    userId,
    authorizationToken,
}: useSendCommentMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.moment.comment({
                userId,
                authorizationToken,
                momentId,
            })
        },
        onSuccess: () => {
            trackUserAction("moment_comment_sent", { moment_id: momentId })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
