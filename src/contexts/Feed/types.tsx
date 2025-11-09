import { LanguagesCodesType } from "../../locales/LanguageTypes"
import { MomentUserActionsProps } from "../../components/moment/context/types"
import { TagProps } from "../newMoment"

export interface ProfilePicture {
    small_resolution: string
    tiny_resolution: string
}

export interface User {
    id: string
    username: string
    verifyed: boolean
    profile_picture: ProfilePicture
    isFollowing: boolean
}

export interface Comment {
    id: string
    user: User
    content: string
    statistics: {
        total_likes_num: number
    }
    created_at: string
}

export interface Media {
    content_type: "VIDEO" | "IMAGE"
    nhd_thumbnail: string
    fullhd_resolution: string
    nhd_resolution: string
}

export interface MomentProps {
    id: string
    user: User
    description?: string
    content_type: "VIDEO" | "IMAGE"
    midia: Media
    comments_count: number
    lastComment?: Comment
    likes_count: number
    isLiked: boolean
    deleted: boolean
    created_at: string
    media: string
    thumbnail: string
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
