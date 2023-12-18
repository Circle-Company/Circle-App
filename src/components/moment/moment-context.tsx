import React, { createContext, useContext } from "react"
import { momentReciveDataProps, momentSizes } from "./moment-types"

const MomentContext = createContext<{ moment: momentReciveDataProps, momentSizes: momentSizes} | null>(null)

export function useMomentContext() {
    const context = useContext(MomentContext)
    if(!context) {
        throw new Error("Moment.* component must be rendered as child of Moment component")
    }
    return context
}

export default MomentContext