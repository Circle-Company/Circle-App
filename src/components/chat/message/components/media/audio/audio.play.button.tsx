import React from "react"
import { View, type ViewStyle } from "react-native"

import MessageSymbol from "../../message.symbol"

/**
 * Botão de reprodução.
 *
 * TODO: alternar para pause e ligar no player — hoje só o ícone está no lugar.
 */
function AudioPlayButton({
    size,
    color,
    backgroundColor,
}: {
    size: number
    color: string
    backgroundColor: string
}) {
    const style: ViewStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
    }

    return (
        <View style={style}>
            <MessageSymbol ios="play.fill" material="play_arrow" size={size * 0.45} color={color} />
        </View>
    )
}

export default React.memo(AudioPlayButton)
