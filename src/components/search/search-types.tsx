import React from "react"

export type SearchRenderItemReciveDataProps = {
    search_data: Array<SearchRenderItemReciveDataObjectProps>
}
export type SearchRenderItemReciveDataObjectProps = {
    user: {
        id: string
        username: string
        name: string | null
        verified: boolean
        profile_picture: {
            fullhd_resolution: string | null
            tiny_resolution: string | null
        }
        statistic: {
            total_followers_num: number
        }
        youFollow: boolean
    }
}

export type SearchMainRootProps = {
    data: SearchRenderItemReciveDataProps
    children: React.ReactNode
}
export type SearchCenterRootProps = {
    children: React.ReactNode
}
export type SearchLeftRootProps = {
    children: React.ReactNode
}
export type SearchRightRootProps = {
    children: React.ReactNode
}
