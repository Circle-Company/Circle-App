import React from "react"

export type RenderItemReciveDataProps = Array<RenderItemReciveDataObjectProps>
export type RenderItemReciveDataObjectProps = {
    user: {
        id: string
        username: string
        name: string | null
        verifyed: boolean
        profile_picture: {
            tiny_resolution: string | null
        }
        you_follow: boolean
        follow_you: boolean
        distance_km: number
    }
}

export type MainRootProps = {
    data: RenderItemReciveDataProps
    children: React.ReactNode
}
export type CenterRootProps = {
    children: React.ReactNode
}
export type LeftRootProps = {
    children: React.ReactNode
}
export type RightRootProps = {
    children: React.ReactNode
}
