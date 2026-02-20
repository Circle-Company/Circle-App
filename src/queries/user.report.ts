import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "@/api"

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
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
