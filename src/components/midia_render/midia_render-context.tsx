import { createContext, useContext } from "react"
import { MidiaReciveDataProps } from "./midia_render-types"
import { MomentSizeProps } from "../moment/context/types"

const MidiaRenderContext = createContext<{
    midia: MidiaReciveDataProps
    content_sizes: MomentSizeProps
} | null>(null)

export function useMidiaRenderContext() {
    const context = useContext(MidiaRenderContext)
    if (!context)
        throw new Error(
            "MidiaRender.* component must be rendered as child of MidiaRender component"
        )
    return context
}

export default MidiaRenderContext
