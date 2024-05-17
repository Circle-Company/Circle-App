import React from "react"
import { MidiaReciveDataProps } from "../midia_render/midia_render-types"
import { MomentDataProps, MomentSizeProps} from "./context/types"

export type MomentMainRootProps = {
    momentData: MomentDataProps
    momentSize: MomentSizeProps
    isFeed: boolean
    isFocused: boolean
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
    children?: React.ReactNode
}
export type MomentBottomRootProps = {
    children: React.ReactNode
}

export type MomentContainerProps = {
    children: React.ReactNode
    contentRender: MidiaReciveDataProps
    blur_color?: string
    blurRadius?: number
    loading?: boolean
    opacity?: number
    isFocused?: boolean
}

export type MomentLikeProps = {
    isLiked: boolean,
    backgroundColor?: string,
    paddingHorizontal?: number,
    margin?: number
}
export type MomentUsernameProps = {
}

export type MomentDescriptionProps = {
    displayOnMoment?: boolean
}
export type MomentDateProps = {
    color?: string
    backgroundColor?: string
    paddingHorizontal?: number
}

export type TagProps = {
    title: string
    color?: string
    backgroundColor?: string
}