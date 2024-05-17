import React from "react"
import { View } from "react-native"
import { MomentTopLeftRootProps } from "../../../moment-types"

export default function top_left_root ({children}: MomentTopLeftRootProps) {

    const container:any = {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    }
    
    return <View style={container}>{children}</View>
}