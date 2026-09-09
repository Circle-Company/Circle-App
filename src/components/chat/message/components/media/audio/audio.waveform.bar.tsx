import React from "react"
import { View } from "react-native"

import { BAR_RADIUS, BAR_WIDTH } from "./audio.constants"

/**
 * Uma barra do traço — estática.
 *
 * Não tem nada de animado: o avanço da reprodução é feito por uma máscara única
 * sobre o traço inteiro (ver `audio.waveform`). Antes cada barra carregava o
 * próprio nó animado, o que dava 18-28 atualizações de estilo por quadro para
 * desenhar uma única fronteira se movendo.
 */
function WaveformBar({
    height,
    color,
    gap,
    opacity,
}: {
    height: number
    color: string
    /** Vão até a barra seguinte. Elástico: preenche a sobra da divisão. */
    gap: number
    opacity: number
}) {
    return (
        <View
            style={{
                width: BAR_WIDTH,
                height,
                marginRight: gap,
                borderRadius: BAR_RADIUS,
                backgroundColor: color,
                opacity,
            }}
        />
    )
}

export default React.memo(WaveformBar)
