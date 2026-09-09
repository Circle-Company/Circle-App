import React from "react"
import ViewersContext from "../../viewers-context"
import { ViewersMainRootProps } from "../../viewers-types"

export default function main_root({
    children,
    data,
    stats,
    momentId,
    errorCode,
    loading = false,
}: ViewersMainRootProps) {
    return (
        <ViewersContext.Provider value={{ viewers: data, stats, momentId, errorCode, loading }}>
            {children}
        </ViewersContext.Provider>
    )
}
