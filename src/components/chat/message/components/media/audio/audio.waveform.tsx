import React from "react"
import {
    Animated,
    PanResponder,
    View,
    type GestureResponderEvent,
    type LayoutChangeEvent,
    type ViewStyle,
} from "react-native"

import AudioProgressIndicator from "./audio.progress.indicator"
import WaveformBar from "./audio.waveform.bar"
import {
    BAR_GAP,
    BAR_MIN_HEIGHT,
    BAR_WIDTH,
    IDLE_OPACITY,
    INDICATOR_SIZE,
    clamp,
    trackWidthFor,
} from "./audio.constants"
import { resampleWaveformBars } from "../../../helpers/calculeWaveformBars"
import { useAudioProgress } from "./audio.progress"

/**
 * O traço: as barras, a bolinha do ponto atual e o gesto de arrastar.
 *
 * O avanço é uma **máscara** sobre uma segunda cópia das barras, em cor cheia:
 * um nó animado desenha a fronteira inteira, incluindo o preenchimento parcial
 * da barra sob o cursor. A alternativa anterior — um nó animado por barra —
 * fazia 28 atualizações de estilo por quadro para o mesmo desenho, e era o que
 * travava a reprodução.
 *
 * A geometria sai da largura **medida**, não da desejada: a bolha tem um teto
 * (`maxWidthRatio`), e quando o traço não cabe é a quantidade de barras que
 * cede, mantendo a espessura — assim o desenho termina exatamente onde o espaço
 * termina.
 */
function AudioWaveform({
    bars,
    height,
    color,
    progress,
    isPlaying,
    durationMs,
    isFallback,
    onSeek,
}: {
    bars: number[]
    height: number
    color: string
    progress: number
    isPlaying?: boolean
    durationMs?: number
    isFallback: boolean
    onSeek?: (progress: number) => void
}) {
    /** Largura que o traço teria se a bolha deixasse. */
    const preferredWidth = trackWidthFor(bars.length)

    /**
     * Largura real do traço, conhecida só depois do primeiro layout.
     *
     * Até lá as barras não são desenhadas: com a largura preferida elas eram
     * dispostas num traço maior do que o disponível e saltavam para o lugar certo
     * no quadro seguinte, o que se via como um piscar para a direita.
     */
    const [measured, setMeasured] = React.useState<{ key: string; width: number } | null>(null)

    /**
     * A medida é presa ao traço que a originou.
     *
     * Sem essa amarra ela sobrevive à reciclagem da linha: a FlashList reaproveita a view, o
     * estado permanece, e o áudio novo desenha as barras com a largura do anterior por um
     * quadro — o traço estica e depois salta. A chave junta a origem e a quantidade de
     * barras, que é tudo que altera a geometria.
     */
    const measureKey = `${bars.length}`
    const measuredWidth = measured && measured.key === measureKey ? measured.width : 0

    const onLayout = React.useCallback(
        (event: LayoutChangeEvent) => {
            const width = event.nativeEvent.layout.width
            if (width <= 0) return
            setMeasured((previous) =>
                previous && previous.key === measureKey && Math.abs(previous.width - width) < 1
                    ? previous
                    : { key: measureKey, width },
            )
        },
        [measureKey],
    )

    /**
     * As barras que cabem de fato, e o vão que preenche a sobra.
     *
     * Espessura fixa e vão elástico: distribuir o resto da divisão entre os vãos
     * faz a última barra encostar na borda direita, em vez de deixar uma fatia
     * morta no fim do traço.
     */
    const { visibleBars, gap, trackWidth } = React.useMemo(() => {
        const width = measuredWidth || preferredWidth
        const fitCount = Math.floor((width + BAR_GAP) / (BAR_WIDTH + BAR_GAP))
        const count = clamp(fitCount, 1, bars.length)

        return {
            visibleBars: count === bars.length ? bars : resampleWaveformBars(bars, count),
            gap: count > 1 ? Math.max(0, (width - count * BAR_WIDTH) / (count - 1)) : 0,
            trackWidth: width,
        }
    }, [bars, measuredWidth, preferredWidth])

    /**
     * Posição sob o dedo enquanto se arrasta; `null` quando ninguém está
     * arrastando.
     *
     * Existe porque o componente é controlado: o `progress` só muda quando quem
     * ouve o `onSeek` devolve o novo valor, e esperar essa volta faria a bolinha
     * andar atrás do dedo.
     */
    const [scrubbing, setScrubbing] = React.useState<number | null>(null)
    const isScrubbing = scrubbing !== null

    const { fillWidth, indicatorLeft } = useAudioProgress(scrubbing ?? progress, trackWidth, {
        isPlaying: isPlaying && !isScrubbing,
        durationMs,
        immediate: isScrubbing,
    })

    // Espelho das props que o gesto consulta.
    //
    // O `PanResponder` é criado uma vez (recriá-lo no meio de um arrasto
    // cancelaria o gesto), então ele não pode fechar sobre `trackWidth` e
    // `onSeek` diretamente — leria os valores do primeiro render para sempre. O
    // efeito mantém o espelho em dia sem escrever em ref durante o render.
    const geometry = React.useRef({ trackWidth, onSeek })

    React.useEffect(() => {
        geometry.current = { trackWidth, onSeek }
    }, [trackWidth, onSeek])

    // O lint vê o ref entrando numa função criada no render e avisa. Aqui é
    // seguro: nada lê `geometry.current` durante o render — só os callbacks, que
    // rodam durante o gesto. A alternativa (recriar o `PanResponder` a cada
    // render, já que a tela costuma passar `onSeek` inline) cancelaria o arrasto
    // no meio.
    /* eslint-disable react-hooks/refs */
    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                // Só assume o gesto se alguém estiver ouvindo: sem `onSeek` o traço
                // é só um desenho, e roubar o toque impediria o long press de abrir
                // o menu de ações da mensagem.
                onStartShouldSetPanResponder: () => !!geometry.current.onSeek,
                onMoveShouldSetPanResponder: () => !!geometry.current.onSeek,

                onPanResponderGrant: (event) => setScrubbing(positionOf(event, geometry.current)),
                onPanResponderMove: (event) => setScrubbing(positionOf(event, geometry.current)),

                onPanResponderRelease: (event) => {
                    const next = positionOf(event, geometry.current)
                    setScrubbing(null)
                    geometry.current.onSeek?.(next)
                },
                // Gesto interrompido (uma rolagem assumiu o toque, por exemplo):
                // devolve o desenho ao valor da tela sem emitir posição nova.
                onPanResponderTerminate: () => setScrubbing(null),
            }),
        [],
    )
    /* eslint-enable react-hooks/refs */

    const styles = React.useMemo(() => {
        const wrapper: ViewStyle = {
            // A largura preferida é o ponto de partida; `flexShrink` deixa a bolha
            // apertar o traço quando falta espaço, e é essa largura apertada que o
            // `onLayout` devolve.
            width: preferredWidth,
            maxWidth: "100%",
            flexShrink: 1,
            height,
            justifyContent: "center",
            // Espaço para o meio corpo que a bolinha avança em cada ponta. Sem ele
            // ela encostaria no botão de play e no texto de duração ao chegar aos
            // extremos — e o `onLayout` mede o conteúdo, não a margem, então o
            // traço continua sabendo a própria largura.
            marginHorizontal: INDICATOR_SIZE / 2,
            // Sem waveform derivada o traço vira uma linha reta: melhor sinalizar
            // que é um placeholder do que fingir um desenho que não veio do áudio.
            opacity: isFallback ? 0.4 : 1,
        }
        const row: ViewStyle = {
            width: trackWidth,
            height,
            flexDirection: "row",
            alignItems: "center",
        }
        // Máscara do trecho já reproduzido: só a largura dela é animada.
        const fillLayer: ViewStyle = {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            overflow: "hidden",
        }
        /**
         * Sombra que acompanha a fronteira do progresso.
         *
         * Fica **fora** da máscara de preenchimento de propósito: dentro dela seria cortada
         * junto com as barras e nunca apareceria sobre o trecho que falta, que é justamente
         * onde ela precisa cair para dar profundidade. Posicionada pelo mesmo valor animado
         * da máscara, então anda com ela sem cálculo próprio.
         */
        return { wrapper, row, fillLayer }
    }, [height, isFallback, preferredWidth, trackWidth])

    /**
     * As barras são desenhadas duas vezes: esmaecidas no fundo e em cor cheia
     * dentro da máscara. São nós estáticos — o custo é de montagem, não de
     * quadro.
     */
    const renderBars = (opacity: number) =>
        visibleBars.map((bar, index) => (
            <WaveformBar
                key={index}
                height={Math.max(BAR_MIN_HEIGHT, bar * height)}
                color={color}
                gap={index === visibleBars.length - 1 ? 0 : gap}
                opacity={opacity}
            />
        ))

    return (
        <View
            style={styles.wrapper}
            onLayout={onLayout}
            // Alvo de toque folgado na vertical: o traço tem a altura do avatar,
            // mas a bolinha tem 9px e ninguém acerta isso com o polegar.
            hitSlop={{ top: 12, bottom: 12 }}
            {...panResponder.panHandlers}
        >
            {measuredWidth > 0 ? (
                <>
                    <View style={styles.row}>{renderBars(IDLE_OPACITY)}</View>

                    <Animated.View style={[styles.fillLayer, { width: fillWidth }]}>
                        <View style={styles.row}>{renderBars(1)}</View>
                    </Animated.View>

                    <AudioProgressIndicator
                        left={indicatorLeft}
                        color={color}
                        isActive={isScrubbing}
                    />
                </>
            ) : null}
        </View>
    )
}

/** Converte a coordenada do toque, relativa ao traço, em progresso 0..1. */
function positionOf(event: GestureResponderEvent, { trackWidth }: { trackWidth: number }): number {
    if (trackWidth <= 0) return 0
    return clamp(event.nativeEvent.locationX / trackWidth, 0, 1)
}

export default React.memo(AudioWaveform)
