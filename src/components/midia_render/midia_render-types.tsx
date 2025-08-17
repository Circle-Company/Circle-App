import { MomentMidiaProps, MomentSizeProps } from "../moment/context/types"

export type MidiaReciveDataProps = MomentMidiaProps

export type MidiaRenderMainRootProps = {
    data: any
    content_sizes: MomentSizeProps
    children: React.ReactNode
}
export type MidiaRenderCenterRootProps = {
    children?: React.ReactNode
}
export type MidiaRenderBottomRootProps = {
    children: React.ReactNode
}

export type MidiaRenderProgressBarProps = {
    videoRef: React.ReactNode
    progress: number
}
