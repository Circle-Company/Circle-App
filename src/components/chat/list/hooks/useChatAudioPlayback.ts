import React from "react"
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio"

export type ChatAudioPlayback = {
    /** Nota de voz tocando agora, ou `null` quando nada toca. */
    playingMessageId: string | null
    /** Progresso da nota em reprodução (0..1). */
    progress: number
    /** Play/pause. Tocar noutra mensagem troca a nota em reprodução. */
    toggle: (messageId: string, uri?: string) => void
    /** Salto na posição, vindo do arrasto no traço. */
    seek: (messageId: string, progress: number) => void
}

/**
 * Reprodução das notas de voz da conversa.
 *
 * Um player só para a lista inteira, e não um por mensagem: numa conversa duas
 * notas nunca tocam ao mesmo tempo, e um player por bolha significaria N
 * instâncias nativas vivas para uma que reproduz — além de deixar "quem está
 * tocando" sem dono, já que ninguém saberia pausar a anterior.
 *
 * Por isso a mensagem é controlada: ela recebe `isPlaying`/`progress` e devolve
 * `onTogglePlay`/`onSeek`. Quem decide é este hook, na altura da lista.
 */
export function useChatAudioPlayback(): ChatAudioPlayback {
    const [playingMessageId, setPlayingMessageId] = React.useState<string | null>(null)
    const [source, setSource] = React.useState<string | null>(null)

    const player = useAudioPlayer(source ? { uri: source } : null)
    const status = useAudioPlayerStatus(player)

    const duration = status?.duration ?? 0
    const progress = duration > 0 ? Math.min(1, (status?.currentTime ?? 0) / duration) : 0

    /**
     * Fim da nota: volta ao início e libera o estado, para o botão mostrar play de
     * novo em vez de pausa numa mensagem parada no fim.
     *
     * Por evento do player, e não observando `status.didJustFinish` num efeito:
     * ali o `setState` seria síncrono a cada atualização de status — várias por
     * segundo durante a reprodução — e cada uma custaria um render em cascata.
     */
    React.useEffect(() => {
        const subscription = player.addListener("playbackStatusUpdate", (update) => {
            if (!update.didJustFinish) return
            player.seekTo(0)
            setPlayingMessageId(null)
        })
        return () => subscription.remove()
    }, [player])

    const toggle = React.useCallback(
        (messageId: string, uri?: string) => {
            // Mesma nota: alterna. É o caso comum, e não vale recarregar a fonte.
            if (messageId === playingMessageId) {
                if (status?.playing) {
                    player.pause()
                    setPlayingMessageId(null)
                } else {
                    player.play()
                    setPlayingMessageId(messageId)
                }
                return
            }

            // Outra nota: a anterior para onde estava e a nova começa do zero.
            player.pause()
            if (!uri) return
            setSource(uri)
            setPlayingMessageId(messageId)
        },
        [player, playingMessageId, status?.playing],
    )

    // Trocou a fonte: o player recarrega e só então pode tocar.
    React.useEffect(() => {
        if (source && playingMessageId) player.play()
    }, [player, source, playingMessageId])

    const seek = React.useCallback(
        (messageId: string, next: number) => {
            if (messageId !== playingMessageId || duration <= 0) return
            player.seekTo(next * duration)
        },
        [duration, player, playingMessageId],
    )

    return { playingMessageId, progress, toggle, seek }
}
