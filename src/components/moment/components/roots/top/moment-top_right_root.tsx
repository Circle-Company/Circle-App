import React from "react"
import { View, Text } from "react-native"
import { MomentTopRightRootProps } from "../../../moment-types"
import { useMomentContext } from "../../../moment-context"

export default function top_right_root ({children}: MomentTopRightRootProps) {
    const { moment } = useMomentContext()

    const container:any = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    }
    
    return (
        <View style={container}>
            {children}
        </View>
    )
}