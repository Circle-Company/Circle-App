import create from 'zustand'
import api from "../../../services/api"
import { ExportMomentDataProps, MomentDataProps, MomentMidiaProps, MomentStatisticsProps, TagProps } from "./types"
import React from 'react'
import { userReciveDataProps } from '../../user_show/user_show-types'
import { CommentsReciveDataProps } from '../../comment/comments-types'
import { LanguagesCodesType } from '../../../locales/LanguageTypes'
export interface MomentDataState extends MomentDataProps{
    getComments: ({page, pageSize}: {page: number, pageSize: number}) => Promise<void>
    getStatistics: () => Promise<void>
    getTags: (moment_id: string) => Promise<void>
    setMomentData: (momentData: MomentDataProps) => void
    exportMomentData: () => Promise<ExportMomentDataProps>
}

export function useMomentData(): MomentDataState {
    const [id, setId] = React.useState<Number>(0)
    const [ user, setUser ] = React.useState({} as userReciveDataProps)
    const [ description, setDescription ] = React.useState<String>('')
    const [ midia, setMidia ] = React.useState({} as MomentMidiaProps)
    const [ comments, setComments ] = React.useState([] as CommentsReciveDataProps)
    const [ statistics, setStatistics ] = React.useState({} as MomentStatisticsProps)
    const [ tags, setTags ] = React.useState([] as TagProps[])
    const [ language, setLanguage ] = React.useState('' as LanguagesCodesType)
    const [ createdAt, setCreatedAt ] = React.useState<String>('')

    async function getComments ({page, pageSize}: {page: number, pageSize: number}) {
        await api.post(`/moment/get-comments?page=${page}&pageSize=${pageSize}`, {moment_id: id})
        .then((response) => {
            if (page === 1) setComments(response.data.comments)
            else setComments([...comments, ...response.data.comments])
        })
        .catch(function (error) { console.log(error) });
    }

    async function getStatistics() {
        await api.post('/moment/get-statistics/view', { moment_id: id})
        .then((response) => { setStatistics(response.data) })
        .catch(function (error) { console.log(error)}) 
    }

    async function getTags() {
        return await api.post('/moment/get-tags?page=1&pageSize=100', { moment_id: id})
        .then((response) => { setTags(response.data); return response.data })
        .catch(function (error) { console.log(error)}) 
    }

    async function exportMomentData(): Promise<ExportMomentDataProps> {
        return {
            id: Number(id),
            userId: Number(user.id),
            tags:  await getTags(),
            type: midia.content_type,
            language: language,
            duration: 0
        }
    }

    function setMomentData (momentData: MomentDataProps) {
        setId(momentData.id)
        setUser(momentData.user)
        setDescription(momentData.description)
        setMidia(momentData.midia)
        setComments(momentData.comments)
        setStatistics(momentData.statistics)
        setTags(momentData.tags)
        setLanguage(momentData.language)
        setCreatedAt(momentData.created_at)
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
        getComments,
        getStatistics,
        getTags,
        setMomentData,
        exportMomentData
    }
}