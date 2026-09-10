import React from "react"
import Reanimated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated"

/** Duração de uma subida (ou de uma descida). O ciclo inteiro é o dobro mais a pausa. */
const HALF_MS = 340

/** Pausa no fim do ciclo, antes de o ponto subir de novo. */
const REST_MS = 260

/** Quanto o ponto sobe, em fração do próprio diâmetro. */
const LIFT_RATIO = 0.7

/** Opacidade em baixo e em cima. O ponto não some: ele recua. */
const DIM = 0.35
const BRIGHT = 1

export type TypingDotProps = {
    size: number
    color: string
    /** Atraso do início, em ms — é o que faz a onda correr da esquerda para a direita. */
    delay: number
}

/**
 * Um ponto do "digitando".
 *
 * Sobe e desce, clareando na subida e recuando na descida. As duas coisas saem do **mesmo**
 * valor animado: a opacidade é interpolada da altura, em vez de ser uma segunda animação
 * correndo em paralelo. Duas animações independentes dessincronizam com o tempo — basta um
 * quadro perdido — e o ponto passa a clarear no caminho de volta.
 *
 * Roda inteiro na thread de UI. Aparece embaixo de uma lista que rola, e uma animação em
 * laço na thread JS engasga junto com ela.
 */
function TypingDot({ size, color, delay }: TypingDotProps) {
    const lift = useSharedValue(0)

    React.useEffect(() => {
        /*
         * Sobe, desce, espera. A pausa é o que dá o ritmo de "alguém escrevendo" em vez de um
         * pêndulo constante — sem ela os três pontos viram uma onda contínua, que lê como
         * carregamento, não como conversa.
         */
        lift.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: HALF_MS, easing: Easing.out(Easing.quad) }),
                    withTiming(0, { duration: HALF_MS, easing: Easing.in(Easing.quad) }),
                    withTiming(0, { duration: REST_MS }),
                ),
                -1,
            ),
        )
    }, [delay, lift])

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: -lift.value * size * LIFT_RATIO }],
        opacity: interpolate(lift.value, [0, 1], [DIM, BRIGHT]),
    }))

    return (
        <Reanimated.View
            style={[
                { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
                style,
            ]}
        />
    )
}

export default React.memo(TypingDot)
