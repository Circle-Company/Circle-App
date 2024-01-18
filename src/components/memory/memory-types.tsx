import { MidiaReciveDataProps } from "../midia_render/midia_render-types"

type MemoryMomentObjectProps = {
    id: number,
    content_type: "image" | "video",
    midia: {
        nhd_resolution: string
    }     
}
export type MemoryObjectProps = {
    id: number,
    title: string,
    moments: Array<MemoryMomentObjectProps>
}
export type MemoryReciveDataProps = {
    id: number,
    title: string,
    updated_at: string,
    moments: Array<MemoryMomentObjectProps>    
}

export type MemoryMainRootProps = {
    data: any,
    children: React.ReactNode
}

export type MemoryContainerProps = {
    contentRender: MidiaReciveDataProps,
    focused?: boolean,
    children: React.ReactNode
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
    text?: string,
    number?: number,
    children?: React.ReactNode
}
export type MemoryDescriptionProps = {
}