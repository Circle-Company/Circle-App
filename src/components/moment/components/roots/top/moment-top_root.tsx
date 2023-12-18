import React from "react"
import { View, Text } from "react-native"
import { MomentTopRootProps } from "../../../moment-types"
import { useMomentContext } from "../../../moment-context"
import sizes from "../../../../../layout/constants/sizes"

export default function top_root ({children}: MomentTopRootProps) {
    const { moment } = useMomentContext()

    const container:any = {
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        padding: sizes.paddings["1sm"]/2
    }
    
    return (
        <View style={container}>
            {children}
        </View>
    )
}