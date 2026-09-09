import { createContext, useContext } from "react"
import { ViewersReciveDataProps, ViewersStatsObject } from "./viewers-types"

const ViewersContext = createContext<{
    viewers: ViewersReciveDataProps
    stats: ViewersStatsObject | null
    momentId: string
    errorCode?: string
    loading: boolean
} | null>(null)

export function useViewersContext() {
    const context = useContext(ViewersContext)
    if (!context) {
        throw new Error("Viewers.* component must be rendered as child of Viewers component")
    }
    return context
}

export default ViewersContext
