import {
    ExportMomentDataProps,
    MomentDataProps,
    MomentMidiaProps,
    MomentStatisticsProps,
    TagProps,
} from "./types"

import { CommentsReciveDataProps } from "@/components/comment/comments-types"
import { LanguagesCodesType } from "@/locales/LanguageTypes"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import api from "@/services/Api"
import { userReciveDataProps } from "@/components/user_show/user_show-types"

export interface MomentDataState extends Omit<MomentDataProps, "isLiked"> {
    getComments: ({ page, pageSize }: { page: number; pageSize: number }) => Promise<void>
    getStatistics: () => Promise<void>
    getTags: (moment_id: string) => Promise<void>
    setMomentData: (momentData: MomentDataProps) => void
    exportMomentData: () => Promise<ExportMomentDataProps>
}

export function useMomentData(): MomentDataState {
    const [id, setId] = React.useState<string>("")
    const [user, setUser] = React.useState({} as userReciveDataProps)
    const [description, setDescription] = React.useState<string>("")
    const [midia, setMidia] = React.useState({} as MomentMidiaProps)
    const [comments, setComments] = React.useState([] as CommentsReciveDataProps)
    const [statistics, setStatistics] = React.useState({} as MomentStatisticsProps)
    const [tags, setTags] = React.useState([] as TagProps[])
    const [language, setLanguage] = React.useState("" as LanguagesCodesType)
    const [isLiked, setIsLiked] = React.useState<boolean>(false)
    const [createdAt, setCreatedAt] = React.useState<string>("")

    const { session } = React.useContext(PersistedContext)

    const jwtToken = session.account.jwtToken

    async function getComments({ page, pageSize }: { page: number; pageSize: number }) {
        await api
            .get(`/moments/${id}/comments?page=${page}&pageSize=${pageSize}`, {
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

    async function getStatistics() {
        await api
            .get(`/moments/${id}/statistics/preview`, {
                headers: { Authorization: jwtToken },
            })
            .then((response) => {
                setStatistics(response.data)
            })
            .catch(function (error) {
                console.log(error)
            })
    }

    async function getTags() {
        return await api
            .get(`/moments/${id}/tags?page=1&pageSize=100`, {
                headers: { Authorization: jwtToken },
            })
            .then((response) => {
                setTags(response.data)
                return response.data
            })
            .catch(function (error) {
                console.log(error)
            })
    }

    async function exportMomentData(): Promise<ExportMomentDataProps> {
        return {
            id: String(id),
            userId: String(user.id),
            tags: await getTags(),
            type: midia.content_type,
            language: language,
            duration: 0,
        }
    }

    function setMomentData(momentData: MomentDataProps) {
        setId(momentData.id)
        setUser(momentData.user)
        setDescription(momentData.description)
        setMidia(momentData.midia)
        setComments(momentData.comments)
        setStatistics(momentData.statistics)
        setTags(momentData.tags)
        setLanguage(momentData.language)
        setCreatedAt(momentData.created_at)
        setIsLiked(momentData.is_liked)
    }

    return {
        id,
        user,
        description,
        midia,
        comments,
        statistics,
        tags,
        language,
        created_at: createdAt,
        is_liked: isLiked,
        getComments,
        getStatistics,
        getTags,
        setMomentData,
        exportMomentData,
    }
}
