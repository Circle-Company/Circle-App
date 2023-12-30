import React from "react"
import { View } from "react-native"
import { MomentMainRootProps } from "../../moment-types"
import MomentContext from "../../moment-context"

export default function main_root ({children, data, sizes}: MomentMainRootProps) {

    const container: any = {
    }
    return (
        <MomentContext.Provider value={{moment: data, momentSizes: sizes}}>
            {children}  
        </MomentContext.Provider>

    )
}