import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "@/api"

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
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
