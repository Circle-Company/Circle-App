import { momentSizes } from "../moment/moment-types"

export type MidiaReciveDataProps = {
    fullhd_resolution: String,
    nhd_resolution: String,
}

export type MidiaRenderMainRootProps = {
    data: any,
    content_sizes: momentSizes,
    children: React.ReactNode
}
export type MidiaRenderCenterRootProps = {
    children?: React.ReactNode
}
export type MidiaRenderBottomRootProps = {
    children: React.ReactNode
}

export type MidiaRenderProgressBarProps = {
    videoRef: React.ReactNode,
    progress: number
}