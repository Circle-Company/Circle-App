import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import { trackUserAction } from "@/lib/trackEvent"

type useReportMutationProps = {
    momentId: string
    reason: string
    description: string
}

export function useMomentReportMutation(props: useReportMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.moment.actions.report(props)
        },
        onSuccess: () => {
            trackUserAction("moment_reported", { moment_id: props.momentId, reason: props.reason })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
