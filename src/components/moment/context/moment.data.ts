import React from "react"
import PersistedContext from "../../../contexts/Persisted"
import api from "../../../services/Api"
import { CommentsReciveDataProps } from "../../comment/comments-types"
import { Moment } from "@/contexts/Feed/types"

export interface MomentDataState {
    comments: CommentsReciveDataProps
    getComments: ({ page, pageSize }: { page: number; pageSize: number }) => Promise<void>
    set: (data: Moment) => void
}

export function useData(): MomentDataState {
    const [data, setData] = React.useState<Moment>({} as Moment)
    const [comments, setComments] = React.useState([] as CommentsReciveDataProps)

    const { session } = React.useContext(PersistedContext)

    const jwtToken = session.account.jwtToken

    async function getComments({ page, pageSize }: { page: number; pageSize: number }) {
        await api
            .get(`/moments/${data.id}/comments?page=${page}&pageSize=${pageSize}`, {
                headers: { Authorization: jwtToken },
            })
            .then((response) => {
                if (page === 1) setComments(response.data.comments)
                else setComments([...comments, ...response.data.comments])
            })
            .catch(function (error) {
                console.log(error)
            })
    }

    function set(data: Moment) {
        setData(data)
    }

    return {
        ...data,
        comments,
        getComments,
        set,
    }
}
