import React from "react"
import { userReciveDataProps } from "../user_show/user_show-types"
import { MidiaReciveDataProps } from "../midia_render/midia_render-types"
import { CommentsReciveDataProps } from "../comment/comments-types"
export type momentReciveDataProps = {
    id: Number,
    user?: userReciveDataProps
    description?: String,
    content_type?: String,
    midia: {
        fullhd_resolution?: String,
        nhd_resolution?: String
    },
    comments?: CommentsReciveDataProps,
    likes_count?: Number,
    deleted?: Boolean,
    created_at?: String
}

export type MomentMainRootProps = {
    data: momentReciveDataProps,
    sizes: momentSizes,
    children: React.ReactNode
}
export type MomentTopRootProps = {
    children: React.ReactNode
}
export type MomentTopLeftRootProps = {
    children: React.ReactNode
}
export type MomentTopRightRootProps = {
    children: React.ReactNode
}
export type MomentCenterRootProps = {
    children: React.ReactNode
}
export type MomentBottomRootProps = {
    children: React.ReactNode
}

export type MomentContainerProps = {
    children: React.ReactNode,
    contentRender: MidiaReciveDataProps,
    focused?: boolean,
}

export type MomentLikeProps = {
    isLiked: boolean,
}
export type MomentUsernameProps = {
}

export type momentSizes = {
    width: number,
    height: number,
    paddingTop?: number,
    padding: number,
    borderRadius?: number,
    borderTopLeftRadius?: number,
    borderTopRightRadius?: number,
    borderBottomLeftRadius?: number,
    borderBottomRightRadius?: number,
}
