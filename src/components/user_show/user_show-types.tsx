import React from "react"

export type userReciveDataProps = {
    id: string
    username: string
    verifyed: boolean
    profile_picture: {
        small_resolution: string
        tiny_resolution: string
    }
    you_follow: boolean
}

export type UserRootProps = {
    executeBeforeClick?: () => void
    data: userReciveDataProps
    children: React.ReactNode
}

export type UserUsernameProps = {
    displayOnMoment?: boolean
    displayYou?: boolean
    disableAnalytics?: boolean
    truncatedSize?: number
    color?: string
    fontSize?: number
    fontFamily?: string
    margin?: number
    onClickAction?: () => void
    scale?: number
}

export type UserProfilePictureProps = {
    pictureDimensions: {
        width: number
        height: number
    }
    displayOnMoment?: boolean
    disableAnalytics?: boolean
    isLoading?: boolean
    onClickAction?: () => void
}

export type UserPressableContainer = {
    children: React.ReactNode
    containerProps?: object
}

export type actionsProps = {
    follow: () => void
    unfollow: () => void
    view_profile: () => void
}

export type UserFollowButtonProps = {
    isFollowing: boolean
    displayOnMoment?: boolean
    hideOnFollowing?: boolean
}
