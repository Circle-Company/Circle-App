import React from "react"
import { View } from "react-native"
import { CommentsTopRootProps } from "../../../comments-types"
import sizes from "../../../../../layout/constants/sizes"

export default function top_root ({children}: CommentsTopRootProps) {
    const container: any = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: sizes.paddings["1sm"]*1.3,
        paddingLeft: sizes.paddings["1md"]*0.7,
        paddingRight: sizes.paddings["1md"]*1.4,
    }
    return <View style={container}>{children}</View>
}