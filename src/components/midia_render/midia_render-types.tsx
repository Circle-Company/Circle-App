import { sizeProps } from "../moment/context/types"

/**
 * A URL da mídia a renderizar.
 *
 * Era `MomentMidiaProps`, um objeto (`{ content_type, fullhd_resolution, nhd_thumbnail, ... }`)
 * que não existe mais no contrato do momento — o tipo nem era exportado, daí o erro. Todos os
 * chamadores de `Moment.Container` passam `data.media`, que é a URL em string.
 */
export type MidiaReciveDataProps = string

export type MidiaRenderMainRootProps = {
    data: any
    content_sizes: sizeProps
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
