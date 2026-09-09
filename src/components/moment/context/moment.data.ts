import React from "react"
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

    async function getComments({ page, pageSize }: { page: number; pageSize: number }) {
        const momentId = data.id
        if (!momentId) throw new Error("Moment id is missing")

        // Aqui havia uma tentativa com o token "cru" e, no 401, um retry com `Bearer`. A
        // dança existia porque o formato do header era ambíguo — e hoje não é: o
        // interceptor injeta `Bearer <access token>` a partir da sessão viva (§3.2). Manter
        // o retry só gastaria uma das duas tentativas de auth da request (§5.4) para
        // reenviar exatamente o mesmo header.
        const res = await api.get(`/moments/${momentId}/comments`, {
            params: { page, pageSize },
        })

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
