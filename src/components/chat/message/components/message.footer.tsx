import React from "react"
import { View, type ViewStyle } from "react-native"

import MessageContext from "../context/provider"
import { MessageChildrenProps } from "../message.types"

/** Rodapé da bolha: "editada", hora e tiques, alinhados à direita. */
export default function FooterRoot({ children }: MessageChildrenProps) {
    const { size } = React.useContext(MessageContext)

    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
        columnGap: size.gap / 1.5,
    }

    return <View style={container}>{children}</View>
}
