import React from "react"
import { Gesture } from "react-native-gesture-handler"
import { useSharedValue, withSpring, type SharedValue } from "react-native-reanimated"

/** Quanto a lista anda para a esquerda quando o horário é revelado, em px. */
export const REVEAL_WIDTH = 64

/** Deslocamento horizontal a partir do qual o gesto é considerado um arrasto. */
const ACTIVATION_DX = 8

/**
 * A volta ao lugar depois de soltar.
 *
 * Rígida e leve: a lista snapa de volta em vez de balançar. `mass` abaixo de 1 encurta o
 * tempo total, e o `damping` fica logo abaixo do crítico para a mola — que, com esta
 * rigidez e massa, fica por volta de 31 — sobrando só um vestígio de repique em vez de um
 * balanço.
 *
 * O horário é uma espiada: quanto mais rápido a lista volta, menos o gesto atrapalha a
 * leitura.
 */
const RETURN_SPRING = { damping: 28, stiffness: 420, mass: 0.6 } as const

/**
 * Gesto de arrastar a lista para a esquerda para revelar o horário.
 *
 * **Roda inteiro na thread de UI**, com Reanimated e Gesture Handler. A versão anterior usava
 * `PanResponder` com `Animated.Value` e `setValue` a cada movimento: isso acontece na thread
 * JS, e cada quadro empurrava atualizações de estilo pela ponte para **duas** views por linha
 * visível — o `translateX` da mensagem e a opacidade do horário. Com uma dezena de linhas na
 * tela, são vinte atualizações por quadro competindo com a rolagem. Era essa a lentidão.
 *
 * Aqui o dedo move um `SharedValue`, e os estilos derivados dele são calculados na própria
 * thread de UI. A thread JS não participa do arrasto: nenhuma travada de render pode
 * engasgar o movimento.
 *
 * O deslocamento é **um só** para todas as mensagens: elas andam juntas, então basta um
 * valor — e o custo por quadro é uma leitura, não uma por mensagem.
 */
export function useRevealGesture(): {
    translateX: SharedValue<number>
    gesture: ReturnType<typeof Gesture.Pan>
} {
    const translateX = useSharedValue(0)

    /*
     * O gesto é montado **uma vez**.
     *
     * Sem isto ele nasce novo a cada render da lista, e o Gesture Handler tem de reconfigurar
     * o reconhecedor nativo no meio do arrasto — que é justamente quando a lista mais
     * re-renderiza. A lista de dependências é vazia de propósito: `translateX` é um
     * `SharedValue`, cuja identidade não muda, e o worklet lê `.value` na thread de UI.
     */
    const gesture = React.useMemo(
        () =>
            Gesture.Pan()
                /*
                 * A arbitragem com a rolagem vertical é do próprio Gesture Handler, e não de
                 * um `onMoveShouldSetPanResponder` escrito à mão: o gesto só assume depois de
                 * um deslocamento horizontal claro, e desiste se o dedo for vertical antes
                 * disso. É a rolagem que tem prioridade, como deve ser numa conversa.
                 */
                .activeOffsetX([-ACTIVATION_DX, ACTIVATION_DX])
                .failOffsetY([-ACTIVATION_DX, ACTIVATION_DX])
                .onUpdate((event) => {
                    "worklet"
                    // Só para a esquerda, e até o limite do que há para revelar.
                    translateX.value = Math.max(-REVEAL_WIDTH, Math.min(0, event.translationX))
                })
                .onEnd(() => {
                    "worklet"
                    // Soltou: volta sozinho. O horário é uma espiada, não um estado — deixar a
                    // lista deslocada esconderia o começo das mensagens.
                    translateX.value = withSpring(0, RETURN_SPRING)
                })
                .onFinalize(() => {
                    "worklet"
                    // Gesto cancelado (a rolagem assumiu, por exemplo): devolve do mesmo jeito.
                    translateX.value = withSpring(0, RETURN_SPRING)
                }),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `translateX` é estável
        [],
    )

    return { translateX, gesture }
}
