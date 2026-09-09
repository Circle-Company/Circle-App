import React from "react"
import { View, type ViewStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import AudioDuration from "./audio.duration"
import AudioPlayButton from "./audio.play.button"
import AudioWaveform from "./audio.waveform"
import MessageContext from "../../../context/provider"
import { MessageAudioProps } from "../../../message.types"
import { WAVEFORM_BAR_COUNT } from "../../../helpers/calculeWaveformBars"
import { useWaveform } from "../../../hooks/useWaveform"

/**
 * Nota de voz: botão de play, traço e duração.
 *
 * Aqui só a composição e o que vem do contexto da mensagem. O desenho do traço,
 * a animação do progresso e cada peça visual vivem nos arquivos vizinhos —
 * assim mexer na waveform não obriga a reler a lógica de tema e formato, e
 * vice-versa.
 */
function MessageAudio({
    barCount = WAVEFORM_BAR_COUNT,
    height,
    progress = 0,
    isPlaying = false,
    onSeek,
}: MessageAudioProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    const media = data.media
    const { bars, isFallback } = useWaveform({
        uri: media?.url,
        precomputed: media?.waveform,
        barCount,
    })

    const isMine = options.isMine
    const foreground = isMine ? colors.background : colors.text
    const waveHeight = height ?? size.avatarSize

    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        columnGap: size.gap,
    }

    // O player só existe no formato de áudio: o `messageType` do contexto é quem
    // decide, não quem monta a árvore. Numa mensagem apagada ele some junto,
    // porque ali o tipo já vira `deleted`.
    if (options.messageType !== "audio" || !media) return null

    return (
        <View style={container}>
            <AudioPlayButton
                size={size.avatarSize}
                color={foreground}
                backgroundColor={isMine ? colors.blur_display_color : colors.backgroundDisabled}
            />

            <AudioWaveform
                bars={bars}
                height={waveHeight}
                color={foreground}
                progress={progress}
                isPlaying={isPlaying}
                durationMs={(media.duration ?? 0) * 1000}
                isFallback={isFallback}
                onSeek={onSeek}
            />

            <AudioDuration
                seconds={media.duration ?? 0}
                color={foreground}
                fontSize={size.fontSize * 0.75}
            />
        </View>
    )
}

/**
 * Memoizado: numa lista de conversa a bolha re-renderiza quando a mensagem
 * vizinha muda, e redesenhar o traço a cada vez é desperdício — as props do
 * player só mudam quando ele é o que está tocando.
 */
export default React.memo(MessageAudio)
