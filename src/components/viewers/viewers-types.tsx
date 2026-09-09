import React from "react"
import type { SharedValue } from "react-native-reanimated"
import type { MomentViewer, MomentViewsStats } from "@/api/moment/moment.types"

export type ViewerObject = MomentViewer
export type ViewersStatsObject = MomentViewsStats
export type ViewersReciveDataProps = ViewerObject[]

export type ViewersMainRootProps = {
    data: ViewersReciveDataProps
    stats: ViewersStatsObject | null
    momentId: string
    /** `code` do envelope de erro do backend (FORBIDDEN, NOT_FOUND, …). */
    errorCode?: string
    loading?: boolean
    children: React.ReactNode
}
export type ViewersContainerProps = {
    children: React.ReactNode
    focused?: boolean
}
export type ViewersTopRootProps = {
    children: React.ReactNode
}
export type ViewersTopLeftRootProps = {
    children: React.ReactNode
}
export type ViewersTopRightRootProps = {
    children: React.ReactNode
}
export type ViewersCenterRootProps = {
    children: React.ReactNode
}
export type ViewersHeaderLeftProps = {
    children: React.ReactNode
}
export type ViewersRenderViewerProps = {
    viewer: ViewerObject
    index: number
}
export type ViewersListViewersProps = {
    /** Altura do bloco rolável. Sem ela a lista cresce com o conteúdo. */
    height?: number
    /** Recebe o offset vertical — é ele que continua encolhendo o moment. */
    scrollY?: SharedValue<number>
    refreshing?: boolean
    onRefresh?: () => void
    loadingMore?: boolean
    onEndReached?: () => void
}
export type ViewersZeroViewersProps = {
    /** Sem `code` é o vazio normal de um moment recém-publicado. */
    code?: string
}
