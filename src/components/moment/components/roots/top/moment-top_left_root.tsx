import React from "react"
import { View, Text } from "react-native"
import { MomentTopLeftRootProps } from "../../../moment-types"
import { useMomentContext } from "../../../moment-context"

export default function top_left_root ({children}: MomentTopLeftRootProps) {
    const { moment } = useMomentContext()

    const container:any = {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    }
    
    return (
        <View style={container}>
            {children}
        </View>
    )
}