import React from "react"

import {
    type ActivityEntry,
    type ActivityMap,
    type ChatActivity,
    type ChatPresence,
    type PlayingState,
    type PresenceMap,
    TYPING_TTL_MS,
    activityInConversation,
    applyPresence,
    applyPresences,
    clearConversationIn,
    isOnlineIn,
    isTypingInConversation,
    pruneExpired,
    startActivityIn,
    startPlayingState,
    stopActivityIn,
    withProgress,
} from "./state"

/**
 * Estado efêmero do chat: quem está digitando, quem está online, quem está gravando áudio,
 * e qual nota de voz toca agora.
 *
 * **Por que um contexto, e não a store persistida.** Nada disto sobrevive ao fechamento do
 * app nem deve ir para o MMKV: presença e digitação são estado de sessão, entregues por
 * evento de WebSocket e válidos por segundos. Guardá-los junto de perfil e credencial faria
 * o `Persisted` reescrever disco a cada tecla que a outra pessoa digita.
 *
 * **Por que global, e não por tela.** Os mesmos dados aparecem em dois lugares ao mesmo
 * tempo: a grade mostra o ponto de online e "digitando…" na célula, e a conversa mostra o
 * mesmo no header. Dois estados locais divergiriam — e o WebSocket é um só.
 *
 * **O que este arquivo não faz:** falar com o Stream. Ele é um repositório de estado com uma
 * API de escrita explícita; quem assina os eventos do canal e chama estes setters é a camada
 * de integração, quando o cliente existir (ver `docs/chat-stream-implementation.md`). Essa
 * separação é o que permite exercitar a UI com mock hoje e trocar a origem depois sem tocar
 * em nenhuma tela.
 *
 * A lógica de estado vive em `state.ts`, em funções puras: renderizar árvore não
 * funciona sob o vitest neste projeto, então o que precisa de teste precisa estar fora do
 * componente.
 */
export type ChatContextData = {
    presence: PresenceMap
    isOnline: (userId: string) => boolean

    activityIn: (cid: string) => ActivityEntry[]
    isTypingIn: (cid: string) => boolean

    /** Nota de voz tocando agora, se houver — é uma só no app inteiro. */
    playing: PlayingState
    isPlaying: (messageId: string) => boolean

    // ── Escrita ────────────────────────────────────────────────────────────────────────
    setPresence: (userId: string, presence: ChatPresence) => void
    setManyPresences: (presences: PresenceMap) => void
    startActivity: (cid: string, userId: string, activity?: ChatActivity) => void
    stopActivity: (cid: string, userId: string) => void
    clearConversation: (cid: string) => void
    startPlaying: (cid: string, messageId: string) => void
    updatePlayingProgress: (progress: number) => void
    stopPlaying: () => void
    reset: () => void
}

const ChatContext = React.createContext<ChatContextData>({} as ChatContextData)

export function Provider({ children }: { children: React.ReactNode }) {
    const [presence, setPresenceState] = React.useState<PresenceMap>({})
    const [activities, setActivities] = React.useState<ActivityMap>({})
    const [playing, setPlaying] = React.useState<PlayingState>(null)

    const setPresence = React.useCallback((userId: string, next: ChatPresence) => {
        setPresenceState((previous) => applyPresence(previous, userId, next))
    }, [])

    const setManyPresences = React.useCallback((batch: PresenceMap) => {
        setPresenceState((previous) => applyPresences(previous, batch))
    }, [])

    const startActivity = React.useCallback(
        (cid: string, userId: string, activity: ChatActivity = "typing") => {
            setActivities((previous) =>
                startActivityIn(previous, cid, userId, activity, Date.now()),
            )
        },
        [],
    )

    const stopActivity = React.useCallback((cid: string, userId: string) => {
        setActivities((previous) => stopActivityIn(previous, cid, userId))
    }, [])

    const clearConversation = React.useCallback((cid: string) => {
        setActivities((previous) => clearConversationIn(previous, cid))
    }, [])

    /**
     * Varredura dos avisos vencidos.
     *
     * Um intervalo só para o app inteiro, e não um `setTimeout` por pessoa: em grupo isso
     * seria um timer por participante, todos fazendo a mesma pergunta. O intervalo só existe
     * enquanto há alguém em atividade.
     */
    const hasActivity = Object.keys(activities).length > 0
    React.useEffect(() => {
        if (!hasActivity) return

        const timer = setInterval(() => {
            setActivities((previous) => pruneExpired(previous, Date.now()))
        }, TYPING_TTL_MS / 2)

        return () => clearInterval(timer)
    }, [hasActivity])

    const startPlaying = React.useCallback((cid: string, messageId: string) => {
        setPlaying(startPlayingState(cid, messageId))
    }, [])

    const updatePlayingProgress = React.useCallback((progress: number) => {
        setPlaying((previous) => withProgress(previous, progress))
    }, [])

    const stopPlaying = React.useCallback(() => setPlaying(null), [])

    const reset = React.useCallback(() => {
        setPresenceState({})
        setActivities({})
        setPlaying(null)
    }, [])

    const isOnline = React.useCallback((userId: string) => isOnlineIn(presence, userId), [presence])

    const activityIn = React.useCallback(
        (cid: string) => activityInConversation(activities, cid, Date.now()),
        [activities],
    )

    const isTypingIn = React.useCallback(
        (cid: string) => isTypingInConversation(activities, cid, Date.now()),
        [activities],
    )

    const isPlaying = React.useCallback(
        (messageId: string) => playing?.messageId === messageId,
        [playing],
    )

    const value = React.useMemo<ChatContextData>(
        () => ({
            presence,
            isOnline,
            activityIn,
            isTypingIn,
            playing,
            isPlaying,
            setPresence,
            setManyPresences,
            startActivity,
            stopActivity,
            clearConversation,
            startPlaying,
            updatePlayingProgress,
            stopPlaying,
            reset,
        }),
        [
            presence,
            isOnline,
            activityIn,
            isTypingIn,
            playing,
            isPlaying,
            setPresence,
            setManyPresences,
            startActivity,
            stopActivity,
            clearConversation,
            startPlaying,
            updatePlayingProgress,
            stopPlaying,
            reset,
        ],
    )

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextData {
    return React.useContext(ChatContext)
}

export type { ChatActivity, ChatPresence } from "./state"
export { TYPING_TTL_MS } from "./state"
export default ChatContext
