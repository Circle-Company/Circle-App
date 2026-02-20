import { useMutation } from "@tanstack/react-query"
import { apiRoutes } from "@/api"

type useBlockMutationProps = {
    userId: string
}

export function useBlockMutation({ userId }: useBlockMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.profile.postBlock({
                blockedUserId: userId,
            })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useUnlockMutation({ userId }: useBlockMutationProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.profile.deleteBlock({
                unlockedUserId: userId,
            })
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
