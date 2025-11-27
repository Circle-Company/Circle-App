import React from "react"

export type ProfileReciveDataProps = {
    id: number
    username: string
    verified: boolean
    name: string | null
    description: string | null
    profile_picture: {
        small_resolution: string
        tiny_resolution: string
    }
    statistics: {
        total_followers_num: number
        total_likes_num: number
        total_views_num: number
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
}
export type ProfileStatisticsContainerProps = {
    children: React.ReactNode
}
