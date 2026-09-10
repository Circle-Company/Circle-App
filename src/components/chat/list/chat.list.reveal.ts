import React from "react"
import { Animated, PanResponder } from "react-native"

/** Quanto a lista anda para a esquerda quando o horário é revelado, em px. */
export const REVEAL_WIDTH = 64

/** Deslocamento horizontal a partir do qual o gesto é considerado um arrasto. */
const ACTIVATION_DX = 8

/**
 * Gesto de arrastar a lista para a esquerda para revelar o horário.
 *
 * O deslocamento é **um só** para todas as mensagens, e não um por linha: elas
 * andam juntas, então basta uma `Animated.Value` — e o custo por quadro é uma
 * atualização de transform, não uma por mensagem.
 *
 * O gesto só é assumido quando o movimento é claramente horizontal e para a
 * esquerda. Sem essa guarda ele roubaria a rolagem vertical, que é o gesto
 * principal de uma conversa.
 */
export function useRevealGesture() {
    // `useState` com inicializador preguiçoso, e não `useRef`: o valor é lido no
    // render (entra no `useMemo` do gesto e vai como prop para as linhas), e ler
    // ref durante o render é o que as regras dos hooks proíbem.
    const [translateX] = React.useState(() => new Animated.Value(0))

    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                // Nunca assume no toque: um toque simples pertence à mensagem
                // (abrir menu, tocar na citação), não à lista.
                onStartShouldSetPanResponder: () => false,
                onMoveShouldSetPanResponder: (_event, gesture) =>
                    gesture.dx < -ACTIVATION_DX && Math.abs(gesture.dx) > Math.abs(gesture.dy),

                // Uma vez assumido, o gesto não é devolvido a ninguém.
                //
                // Sem isto a `FlatList` reivindicava o toque no meio do arrasto —
                // basta o dedo derivar alguns pixels na vertical —, o gesto era
                // terminado e a lista voltava sozinha com o dedo ainda na tela. O
                // deslocamento só desfaz ao soltar ou ao arrastar de volta.
                onPanResponderTerminationRequest: () => false,
                onShouldBlockNativeResponder: () => true,

                onPanResponderMove: (_event, gesture) => {
                    // Só para a esquerda, e até o limite do que há para revelar.
                    translateX.setValue(Math.max(-REVEAL_WIDTH, Math.min(0, gesture.dx)))
                },

                // Soltou: volta sozinho. O horário é uma espiada, não um estado —
                // deixar a lista deslocada esconderia o começo das mensagens.
                onPanResponderRelease: () => springBack(translateX),
                onPanResponderTerminate: () => springBack(translateX),
            }),
        [translateX],
    )

    return { translateX, panHandlers: panResponder.panHandlers }
}

function springBack(value: Animated.Value) {
    Animated.spring(value, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 14,
    }).start()
}
