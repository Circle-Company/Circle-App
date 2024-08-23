import { MidiaReciveDataProps } from "../midia_render/midia_render-types"
import { userReciveDataProps } from "../user_show/user_show-types"

export type MemoryMomentObjectProps = {
    id: number
    content_type: "IMAGE" | "VIDEO"
    midia: {
        nhd_resolution: string
    }
}
export type MemoryObjectProps = {
    id: number
    title: string
    moments: Array<MemoryMomentObjectProps>
}

export interface MemoryUser extends Omit<userReciveDataProps, "isFollowing"> {
    you_follow: boolean
}

export type MemoryReciveDataProps = {
    user: MemoryUser
    id: number
    title: string
    updated_at: string
    moments: Array<MemoryMomentObjectProps>
    isAccountScreen?: boolean
}

export type MemoryMainRootProps = {
    data: any
    children: React.ReactNode
}

export type MemoryContainerProps = {
    contentSizes?: any
    contentRender: MidiaReciveDataProps
    focused?: boolean
    children?: React.ReactNode
}
export type MemoryCenterRootProps = {
    children?: React.ReactNode
}
export type MemoryTopRootProps = {
    children: React.ReactNode
}
export type MemoryTopLeftRootProps = {
    children: React.ReactNode
}
export type MemoryTopRightRootProps = {
    children: React.ReactNode
}

export type MemoryHeaderProps = {
    children: React.ReactNode
}
export type MemoryHeaderRightProps = {
    children: React.ReactNode
}
export type MemoryHeaderLeftProps = {
    text?: string
    number?: number
    children?: React.ReactNode
}
export type MemoryDescriptionProps = {}
