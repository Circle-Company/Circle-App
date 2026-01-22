import React from "react"

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
        totalFollowers: number
    }
    interactions: {
        isFollowing: boolean
        isFollowedBy: boolean
        isBlockedBy: boolean
        isBlocking: boolean
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
