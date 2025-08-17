import { View, ViewStyle } from "react-native"

import React from "react"
import sizes from "../../../../layout/constants/sizes"
import { CommentsHeaderLeftProps } from "../../comments-types"

export default function header_left({ children }: CommentsHeaderLeftProps) {
    const container: ViewStyle = {
        paddingLeft: sizes.paddings["1sm"] * 0.7,
        flexDirection: "row",
        width: 120,
        borderRadius: 20,
        paddingVertical: 4,
    }
    return (
        <View style={container}>
            {children}
        </View>
    )
}
