import React from "react"
import { Animated, Easing } from "react-native"

import { INDICATOR_SIZE, RESYNC_THRESHOLD, SMOOTHING_MS, clamp } from "./audio.constants"

export type AudioProgressOptions = {
    /** Tocando: a animação corre sozinha até o fim, sem esperar cada aviso. */
    isPlaying?: boolean
    /** Duração da nota, em ms. Sem ela não dá para saber quanto falta. */
    durationMs?: number
    /**
     * Sem suavização: durante um arrasto o traço tem que grudar no dedo. Os
     * milissegundos que dão continuidade à reprodução viram atraso quando é o
     * usuário quem move o cursor.
     */
    immediate?: boolean
}

export type AudioProgressAnimation = {
    /** Largura da máscara de preenchimento, em px. */
    fillWidth: Animated.AnimatedInterpolation<number>
    /** Posição da bolinha, presa dentro do traço. */
    indicatorLeft: Animated.AnimatedInterpolation<number>
}

/**
 * Traduz o `progress` (0..1) nos dois nós animados que o traço consome.
 *
 * São **dois**, e não um por barra: a reprodução move uma única fronteira, então
 * animar cada barra separadamente multiplicava por 28 o trabalho de cada quadro
 * para desenhar exatamente o mesmo movimento.
 *
 * Tocando, a animação é **uma só**, do ponto atual até o fim, com a duração do
 * que falta. Os `progress` que chegam do player (a cada ~250ms) não reiniciam
 * nada: só corrigem quando a diferença passa de `RESYNC_THRESHOLD`. Era esse
 * reinício por aviso que fazia o traço engasgar, mesmo com o áudio correndo liso.
 */
export function useAudioProgress(
    progress: number,
    trackWidth: number,
    { isPlaying = false, durationMs = 0, immediate = false }: AudioProgressOptions = {},
): AudioProgressAnimation {
    // `useState` com inicializador preguiçoso, e não `useRef`: o valor é lido
    // durante o render (nas interpolações abaixo), e ler um ref no render é
    // justamente o que as regras dos hooks proíbem.
    const [animated] = React.useState(() => new Animated.Value(clamp(progress, 0, 1)))

    /** Espelho do valor animado, para saber o desvio sem reiniciar a animação. */
    const current = React.useRef(clamp(progress, 0, 1))

    React.useEffect(() => {
        const id = animated.addListener(({ value }) => {
            current.current = value
        })
        return () => animated.removeListener(id)
    }, [animated])

    /** Animação em curso, para saber se ela ainda está correndo. */
    const running = React.useRef<Animated.CompositeAnimation | null>(null)

    const stopRunning = React.useCallback(() => {
        running.current?.stop()
        running.current = null
    }, [])

    React.useEffect(() => {
        const target = clamp(progress, 0, 1)

        if (immediate) {
            stopRunning()
            animated.setValue(target)
            return
        }

        // Parado (ou sem saber a duração): interpola até o valor recebido e para.
        if (!isPlaying || durationMs <= 0) {
            stopRunning()
            const animation = Animated.timing(animated, {
                toValue: target,
                duration: SMOOTHING_MS,
                easing: Easing.linear,
                // Largura e posição não são aceleráveis pelo driver nativo; só
                // transform e opacity são.
                useNativeDriver: false,
            })
            running.current = animation
            animation.start(() => {
                running.current = null
            })
            return
        }

        // Tocando e ainda em sincronia: **não toca na animação em curso**.
        //
        // Este `return` é o coração da suavidade. Antes o efeito devolvia um
        // cleanup que parava a animação, e como ele reroda a cada `progress`
        // recebido, a animação longa era cancelada a cada aviso do player — o
        // traço só andava nos instantes em que um aviso chegava, que é exatamente
        // o engasgo que se via.
        if (running.current && Math.abs(current.current - target) < RESYNC_THRESHOLD) return

        stopRunning()
        animated.setValue(target)

        const animation = Animated.timing(animated, {
            toValue: 1,
            duration: Math.max(0, (1 - target) * durationMs),
            easing: Easing.linear,
            useNativeDriver: false,
        })
        running.current = animation
        animation.start(() => {
            running.current = null
        })
    }, [animated, durationMs, immediate, isPlaying, progress, stopRunning])

    // A animação só é interrompida ao desmontar; enquanto o componente vive, quem
    // decide pará-la é o efeito acima.
    React.useEffect(() => stopRunning, [stopRunning])

    const fillWidth = React.useMemo(
        () =>
            animated.interpolate({
                inputRange: [0, 1],
                outputRange: [0, Math.max(0, trackWidth)],
                extrapolate: "clamp",
            }),
        [animated, trackWidth],
    )

    /**
     * Posição da bolinha: o centro **sempre** em cima da borda do preenchimento.
     *
     * `left = progresso * largura - raio`, sem trava nas pontas. A trava anterior
     * mantinha a bolinha inteira dentro do traço, mas ao custo de ela parar de
     * acompanhar o progresso justamente no fim — e como ela é maior que a barra,
     * a dessincronia ficava visível. Entre conter o desenho e dizer a verdade
     * sobre a posição, a verdade vale mais: o envelope não recorta, então ela
     * pode passar meio corpo da borda sem ser cortada.
     */
    const indicatorLeft = React.useMemo(() => {
        const width = Math.max(0, trackWidth)
        const radius = INDICATOR_SIZE / 2

        return animated.interpolate({
            inputRange: [0, 1],
            outputRange: [-radius, width - radius],
            extrapolate: "clamp",
        })
    }, [animated, trackWidth])
    return { fillWidth, indicatorLeft }
}
