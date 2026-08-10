import React from "react"
import type { FriendshipRelation } from "@/api/friendship/friendship.types"

export type ProfileReciveDataProps = {
    id: number
    username: string
    name: string | null
    description: string | null
    profilePicture: string | null
    status: {
        verified: boolean
    }
    metrics: {
        totalMomentsCreated: number
        /** @deprecated substituído por `totalFriends` na API de amizade */
        totalFollowers: number
        totalFriends?: number
    }
    interactions: {
        /** @deprecated o modelo de follow deu lugar à amizade recíproca */
        isFollowing: boolean
        /** @deprecated o modelo de follow deu lugar à amizade recíproca */
        isFollowedBy: boolean
        isBlockedBy: boolean
        isBlocking: boolean
        areFriends?: boolean
        friendshipStatus?: FriendshipRelation
    }
}
export type ProfileMainRootProps = {
    children: React.ReactNode
    data: ProfileReciveDataProps
}
export type ProfileShareProps = {
    color?: string
    backgroundColor?: string
}
export type ProfileNameProps = {
    color?: string
    fontSize?: number
    fontFamily?: string
    margin?: number
    scale?: number
}
export type ProfilePictureProps = {
    fromProfile?: boolean
    hasOutline?: boolean
}
export type ProfileStatisticsContainerProps = {
    children: React.ReactNode
}
