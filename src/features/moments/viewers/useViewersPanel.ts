import React from "react"
import {
    Extrapolation,
    interpolate,
    useSharedValue,
    withTiming,
    type SharedValue,
} from "react-native-reanimated"
import FeedContext from "@/contexts/Feed"

/**
 * Os dois números são os MESMOS do modo comentário do feed
 * (`render-moment-feed.tsx`): o card sobe 110px e encolhe até 0.62. O painel de
 * visualizadores não é uma animação nova — é o mesmo movimento, dirigido por
 * outro progresso.
 */
export const VIEWERS_MOVE_UP = 110
export const VIEWERS_SCALE_SHRINK = 0.38

/** Escala do card com o painel aberto e a lista no topo: 1 - 0.38. */
export const VIEWERS_OPEN_SCALE = 1 - VIEWERS_SCALE_SHRINK

/** O scroll continua o mesmo movimento além do estado aberto, até o limite. */
export const VIEWERS_SCROLL_SCALE_SHRINK = 0.12
export const VIEWERS_SCROLL_MOVE_UP = 44
/** Quantos px de scroll levam o card do estado aberto até o limite. */
export const VIEWERS_SCROLL_RANGE = 240
/** Limite: por mais que se role, o card não encolhe além disto. */
export const VIEWERS_MIN_SCALE = VIEWERS_OPEN_SCALE - VIEWERS_SCROLL_SCALE_SHRINK

export const VIEWERS_OPEN_DURATION = 260

/**
 * Transform do moment com o painel de visualizadores aberto, na mesma fórmula
 * do modo comentário:
 *
 *     translateY = -MOVE_UP * rise
 *     scale      = 1 - SCALE_SHRINK * rise
 *
 * Lá o `rise` é `commentEnabled × progresso do teclado × foco`; aqui é
 * `painel aberto × foco`. O scroll da lista estende o mesmo movimento até
 * `VIEWERS_MIN_SCALE` e para ali.
 */
export function viewersMomentTransform(open: number, scroll: number, focus: number = 1) {
    "worklet"
    const rise = open * focus
    const scrollRise =
        rise * interpolate(scroll, [0, VIEWERS_SCROLL_RANGE], [0, 1], Extrapolation.CLAMP)
    return {
        rise,
        scrollRise,
        translateY: -(VIEWERS_MOVE_UP * rise + VIEWERS_SCROLL_MOVE_UP * scrollRise),
        scale: 1 - VIEWERS_SCALE_SHRINK * rise - VIEWERS_SCROLL_SCALE_SHRINK * scrollRise,
    }
}

export type ViewersPanelState = {
    isOpen: boolean
    /**
     * Segue `isOpen` na abertura e só cai depois que a animação de fechar
     * termina — sem isso o painel some de uma vez enquanto o card ainda está
     * voltando à escala cheia.
     */
    shouldRender: boolean
    /** 0 fechado, 1 aberto — animado com timing. */
    openProgress: SharedValue<number>
    /** Offset vertical da lista de visualizadores. */
    scrollY: SharedValue<number>
    close: () => void
}

/**
 * Liga um moment ao painel de visualizadores: diz se ele está aberto e entrega
 * os dois valores que dirigem a animação do card.
 */
export function useViewersPanel(momentId: string): ViewersPanelState {
    const { viewersMomentId, setViewersMomentId } = React.useContext(FeedContext)
    const id = String(momentId || "")
    const isOpen = !!id && viewersMomentId === id

    const openProgress = useSharedValue(isOpen ? 1 : 0)
    const scrollY = useSharedValue(0)
    const [shouldRender, setShouldRender] = React.useState(isOpen)

    React.useEffect(() => {
        openProgress.value = withTiming(isOpen ? 1 : 0, { duration: VIEWERS_OPEN_DURATION })

        if (isOpen) {
            setShouldRender(true)
            return
        }
        // Fechar desfaz o encolhimento vindo do scroll junto com a animação,
        // em vez de largá-lo num quadro só.
        scrollY.value = withTiming(0, { duration: VIEWERS_OPEN_DURATION })
        const timeout = setTimeout(() => setShouldRender(false), VIEWERS_OPEN_DURATION)
        return () => clearTimeout(timeout)
    }, [isOpen, openProgress, scrollY])

    // Sair da tela (ou a célula do feed ser reciclada) não pode deixar o
    // estado aberto apontando para um card que não está mais montado.
    const isOpenRef = React.useRef(isOpen)
    isOpenRef.current = isOpen
    React.useEffect(
        () => () => {
            if (isOpenRef.current) setViewersMomentId(null)
        },
        [setViewersMomentId],
    )

    const close = React.useCallback(() => setViewersMomentId(null), [setViewersMomentId])

    return { isOpen, shouldRender, openProgress, scrollY, close }
}
