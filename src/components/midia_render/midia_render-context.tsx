import React, { createContext, useContext } from "react"
import { MidiaReciveDataProps } from "./midia_render-types"
import { momentSizes } from "../moment/moment-types"

const MidiaRenderContext = createContext<{ midia: MidiaReciveDataProps, content_sizes: momentSizes} | null>(null)

export function useMidiaRenderContext() {
    const context = useContext(MidiaRenderContext)
    if(!context) {
        throw new Error("MidiaRender.* component must be rendered as child of MidiaRender component")
    }
    return context
}

export default MidiaRenderContext