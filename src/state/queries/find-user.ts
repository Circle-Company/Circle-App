import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "../../services/Api"

type useFindUserByPkMutationProps = {
    userId: number
    findedUserPk: number
}

export function useFindUserByPkMutation({ findedUserPk, userId }: useFindUserByPkMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            return await apiRoutes.user.getByPk({
                userId,
                findedUserPk,
            })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
