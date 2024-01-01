import React from "react"

export type ProfileReciveDataProps = {
    id: number,
    username: string,
    verifyed: true,
    profile_picture: {
        small_resolution: string,
        tiny_resolution: string
    },
    name: string,
    description: string,
    statistics: {
        followers: number,
        likes: number,
        views: number
    }
}
export type ProfileMainRootProps = {
    children: React.ReactNode,
    data: ProfileReciveDataProps
}
export type ProfileShareProps = {
    color?: string,
    backgroundColor?: string
}
export type ProfileNameProps = {
    color?: string,
}
export type ProfilePictureProps = {
}
export type ProfileDescriptionProps = {
}
export type ProfileStatisticsContainerProps = {
    children: React.ReactNode
}
export type ProfileStatisticsFollowersProps = {
}
export type ProfileStatisticsLikesProps = {
}
export type ProfileStatisticsViewsProps = {
}