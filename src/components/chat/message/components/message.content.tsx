import React from "react"
import { View, type ViewStyle } from "react-native"

import MessageContext from "../context/provider"
import { MessageChildrenProps } from "../message.types"

/** Corpo da bolha: citação, mídia e texto empilhados. */
export default function ContentRoot({ children }: MessageChildrenProps) {
    const { size } = React.useContext(MessageContext)

    const container: ViewStyle = {
        flexDirection: "column",
        rowGap: size.gap,
    }

    return <View style={container}>{children}</View>
}
