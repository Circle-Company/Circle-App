import React from "react"
import type { AxiosError } from "axios"
import PersistedContext from "../../../contexts/Persisted"
import api from "../../../api"
import { CommentsReciveDataProps } from "../../comment/comments-types"
import { Moment } from "@/contexts/Feed/types"

export interface MomentDataState {
    comments: CommentsReciveDataProps
    getComments: ({ page, pageSize }: { page: number; pageSize: number }) => Promise<any>
    set: (data: Moment) => void
}

export function useData(): MomentDataState {
    const [data, setData] = React.useState<Moment>({} as Moment)
    const [comments, setComments] = React.useState<CommentsReciveDataProps>([])
    const { session } = React.useContext(PersistedContext)

    async function getComments({ page, pageSize }: { page: number; pageSize: number }) {
        const momentId = data.id
        if (!momentId) throw new Error("Moment id is missing")

        const token = session?.account?.jwtToken
        const params = { page, pageSize }

        const request = (authorization?: string) =>
            api.get(`/moments/${momentId}/comments`, {
                params,
                headers: authorization ? { Authorization: authorization } : undefined,
            })

        let res: any

        try {
            // 1) Tenta com token cru (padrão do backend)
            res = await request(token || undefined)
        } catch (e) {
            const err = e as AxiosError
            const status = (err.response as any)?.status
            // 2) Se 401, tenta novamente com Bearer
            if (status === 401 && token) {
                const bearer = token.startsWith("Bearer ") ? token : `Bearer ${token}`
                res = await request(bearer)
            } else {
                // Outros erros: propaga
                console.error("getComments error (first attempt):", err)
                throw err
            }
        }

        const received = Array.isArray(res?.data?.comments) ? res.data.comments : []
        if (page === 1) setComments(received)
        else setComments((prev) => [...prev, ...received])

        return res
    }

    function set(next: Moment) {
        setData(next)
    }

    return {
        ...data,
        comments,
        getComments,
        set,
    }
}
