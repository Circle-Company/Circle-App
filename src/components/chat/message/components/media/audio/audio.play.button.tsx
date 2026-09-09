import React from "react"
import { Text, View, type ViewStyle } from "react-native"

/**
 * Botão de reprodução.
 *
 * TODO: trocar o glifo pelo ícone de play/pause e ligar no player — hoje é só o
 * lugar dele na composição.
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
            <Text style={{ color }}>▶</Text>
        </View>
    )
}

export default React.memo(AudioPlayButton)
