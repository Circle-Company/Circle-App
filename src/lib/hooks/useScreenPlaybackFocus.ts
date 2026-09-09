import React from "react"
import { useIsFocused, useNavigation } from "expo-router"

/** Se `transitionEnd` não chegar, não dá para deixar o vídeo tocando para sempre. */
const TRANSITION_SAFETY_MS = 700

/**
 * Foco da tela **para fins de reprodução** — igual a `useIsFocused`, exceto que continua
 * `true` enquanto uma transição de navegação está em curso.
 *
 * `useIsFocused` vira `false` no **início** da transição na tela de origem, e só vira `true`
 * no **fim** dela na tela de destino. Numa transição de zoom isso deixa uma janela em que
 * nenhum dos dois lados está focado: o card de origem congela no primeiro frame da
 * animação e o de destino só começa a tocar depois que ela termina. O usuário toca num
 * vídeo que está rodando e vê a imagem parar exatamente durante o zoom.
 *
 * Cobrindo a transição, o vídeo atravessa a animação rodando dos dois lados, e a pausa
 * acontece logo depois — que é onde ela sempre foi necessária: sair da aba do feed, abrir um
 * perfil ou trocar para a conta ainda param o vídeo e o áudio, só que ao fim do movimento e
 * não no começo dele.
 */
export function useScreenPlaybackFocus(): boolean {
    const isFocused = useIsFocused()
    const navigation = useNavigation()
    const [isTransitioning, setIsTransitioning] = React.useState(false)
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
        const clearSafety = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
        }

        const onStart = () => {
            setIsTransitioning(true)
            clearSafety()
            // Rede de proteção: nem toda pilha emite `transitionEnd` (o evento não existe,
            // por exemplo, numa troca de aba sem animação). Sem isto, um `transitionStart`
            // órfão deixaria o áudio tocando numa tela que o usuário já abandonou.
            timeoutRef.current = setTimeout(() => setIsTransitioning(false), TRANSITION_SAFETY_MS)
        }

        const onEnd = () => {
            clearSafety()
            setIsTransitioning(false)
        }

        // `addListener` de eventos de transição só existe em pilhas nativas; em qualquer
        // outro navigator o subscribe lança e o hook degrada para o `useIsFocused` puro.
        let unsubStart: (() => void) | undefined
        let unsubEnd: (() => void) | undefined
        try {
            unsubStart = (navigation as any).addListener("transitionStart", onStart)
            unsubEnd = (navigation as any).addListener("transitionEnd", onEnd)
        } catch {
            // noop
        }

        return () => {
            clearSafety()
            unsubStart?.()
            unsubEnd?.()
        }
    }, [navigation])

    return isFocused || isTransitioning
}
