import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import { trackUserAction } from "@/lib/trackEvent"

type useReportMutationProps = {
    userId: string
    reason: string
    description: string
}

export function useReportMutation(props: useReportMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.profile.postReport(props)
        },
        onSuccess: () => {
            trackUserAction("user_reported", { target_user_id: props.userId, reason: props.reason })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
