import React from "react"
import { Animated, type ViewStyle } from "react-native"

import { INDICATOR_SIZE } from "./audio.constants"

/** Bolinha do ponto atual: o centro fica alinhado ao fim do preenchimento. */
function AudioProgressIndicator({
    left,
    color,
    isActive = false,
}: {
    left: Animated.AnimatedInterpolation<number>
    color: string
    /** Arrastando: a bolinha cresce, para o dedo não escondê-la por completo. */
    isActive?: boolean
}) {
    const size = isActive ? INDICATOR_SIZE * 1.6 : INDICATOR_SIZE
    const style: ViewStyle = {
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        // A interpolação de `left` posiciona o centro da bolinha padrão; quando ela
        // cresce, o excedente é compensado aqui para o centro não escorregar.
        marginLeft: -(size - INDICATOR_SIZE) / 2,
    }

    return <Animated.View style={[style, { left }]} />
}

export default React.memo(AudioProgressIndicator)
