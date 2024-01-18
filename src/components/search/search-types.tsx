import React from "react"

export type SearchRenderItemReciveDataProps = {
    search_data: Array<SearchRenderItemReciveDataObjectProps>
}
export type SearchRenderItemReciveDataObjectProps = {
    user: {
        id: number,
        username: string,
        name: string | null,
        verifyed: boolean,
        profile_picture: {
            fullhd_resolution: string | null,
            tiny_resolution: string | null
        },
        statistic: {
            total_followers_num: number
        }
        you_follow: boolean        
    }

}

export type SearchMainRootProps = {
    data: SearchRenderItemReciveDataProps,
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