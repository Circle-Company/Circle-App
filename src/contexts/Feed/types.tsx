import { LanguagesCodesType } from "../../locales/LanguageTypes"
import { MomentUserActionsProps } from "../../components/moment/context/types"
import React from "react"
import { TagProps } from "../newMoment"

export interface User {
    id: string
    username: string
    verified: boolean
    profilePicture: string
    isFollowing: boolean
}

export interface TopComment {
    id: string
    content?: string
    richContent?: string
    user: {
        id: string
        username: string
        profilePicture?: string
        verified?: boolean
        isFollowing?: boolean
    }
    sentiment?: string
    likesCount: number
    createdAt?: string
}
export interface MomentProps {
    id: string
    user: User
    description?: string
    content_type: "IMAGE" | "VIDEO"
    midia: {
        content_type: "IMAGE" | "VIDEO"
        nhd_thumbnail: string
        fullhd_resolution: string
        nhd_resolution: string
    }
    comments_count: number
    likes_count: number
    isLiked: boolean
    deleted: boolean
    created_at: string
    lastComment?: TopComment
    media: string
    thumbnail: string
    topComment?: TopComment
    duration: number
    size: string
    hasAudio: boolean
    ageRestriction: boolean
    contentWarning: boolean
    metrics: {
        totalViews: number
        totalLikes: number
        totalComments: number
    }
    publishedAt: string
}

export type InteractionProps = {
    id: number
    tags: TagProps[]
    duration: number
    type: "IMAGE" | "VIDEO"
    language: LanguagesCodesType
    interaction: MomentUserActionsProps
}

export type FeedProviderProps = {
    children: React.ReactNode
}
