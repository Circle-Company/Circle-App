import React from "react"
import { CommentObject } from "@/components/comment/comments-types"

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
        profilePicture: string
        verified?: boolean
        you_follow?: boolean
    }
    sentiment: string
    createdAt: string
}

export interface Moment {
    id: string
    user: {
        id: string
        username: string
        profilePicture: string
    }
    media: string
    thumbnail: string
    duration: number
    size: string
    hasAudio: boolean
    description: string
    ageRestriction: boolean
    contentWarning: boolean
    metrics: {
        totalViews: number
        totalLikes: number
        totalComments: number
    }
    topComment?: CommentObject
    isLiked?: boolean
    publishedAt: string
}

export type FeedResponse = {
    success: boolean
    moments: Moment[]
    total: number
}

export type FeedProviderProps = {
    children: React.ReactNode
}
