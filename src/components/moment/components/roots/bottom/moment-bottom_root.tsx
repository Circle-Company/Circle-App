import React from "react"
import { View, Text } from "react-native"
import { MomentBottomRootProps } from "../../../moment-types"
import { useMomentContext } from "../../../moment-context"
import sizes from "../../../../../layout/constants/sizes"

export default function bottom_root ({children}: MomentBottomRootProps) {
    const { moment, momentSizes} = useMomentContext()

    const container:any = {
        width: '100%',
        padding: sizes.paddings["1sm"]/2
    }
    
    return (
        <View style={container}>
            {children}
        </View>
    )
}