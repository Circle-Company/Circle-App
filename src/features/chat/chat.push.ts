import React from "react"
import { useFocusEffect } from "expo-router"

/**
 * O push de mensagem nova.
 *
 * **Vem do nosso backend via Expo, não do push nativo do Stream** — por isso o app não chama
 * `client.addDevice()`: registrar o aparelho no Stream faria as duas vias entregarem a mesma
 * mensagem, e a pessoa receberia dois avisos.
 *
 * O que este arquivo resolve é o que o payload não diz: qual conversa está aberta agora.
 */

/** O payload que o backend manda em `content.data`. */
export type ChatPushData = {
    type: "NEW_MESSAGE"
    screen: "chat"
    /** Sem o prefixo `messaging:`. */
    channelId: string
    messageId?: string
    actorId?: string
    actorName?: string
    actorUsername?: string
    actorPhotoUrl?: string | null
    messagePreview?: string | null
}

/**
 * A conversa aberta na tela, se houver.
 *
 * Módulo, e não contexto, porque quem precisa da informação é o `setNotificationHandler` —
 * que roda **fora** da árvore do React, no escopo do módulo, antes de qualquer componente
 * montar. Um contexto seria inalcançável de lá.
 */
let activeChannelId: string | null = null

/** Só o id, sem o tipo: é assim que o push manda, e a comparação precisa dos dois iguais. */
const idOnly = (value: string): string => {
    const separator = value.indexOf(":")
    return separator === -1 ? value : value.slice(separator + 1)
}

/** Registra a conversa aberta enquanto a tela estiver em foco. */
export function useActiveChatChannel(channelId: string): void {
    useFocusEffect(
        React.useCallback(() => {
            activeChannelId = idOnly(channelId)
            return () => {
                // Só limpa se ainda for a nossa: navegar de uma conversa direto para outra
                // monta a próxima antes de desmontar esta, e limpar sem checar apagaria o
                // registro que a tela nova acabou de escrever.
                if (activeChannelId === idOnly(channelId)) activeChannelId = null
            }
        }, [channelId]),
    )
}

/** `true` quando o push é de mensagem e a conversa dele já está na tela. */
export function isForOpenConversation(data: unknown): boolean {
    const payload = asChatPush(data)
    return Boolean(payload && activeChannelId && idOnly(payload.channelId) === activeChannelId)
}

/**
 * Reconhece o push de mensagem nova.
 *
 * Exige `type` **e** `channelId`: sem o id não há para onde navegar, e um push de outro tipo
 * que por acaso aponte para a tela de chat não é uma mensagem — tratá-lo como uma abriria uma
 * conversa que não existe.
 */
export function asChatPush(data: unknown): ChatPushData | null {
    if (!data || typeof data !== "object") return null

    const payload = data as Record<string, unknown>
    if (payload.type !== "NEW_MESSAGE") return null
    if (typeof payload.channelId !== "string" || !payload.channelId) return null

    return {
        type: "NEW_MESSAGE",
        screen: "chat",
        channelId: payload.channelId,
        messageId: typeof payload.messageId === "string" ? payload.messageId : undefined,
        actorId: typeof payload.actorId === "string" ? payload.actorId : undefined,
        actorName: typeof payload.actorName === "string" ? payload.actorName : undefined,
        actorUsername:
            typeof payload.actorUsername === "string" ? payload.actorUsername : undefined,
        actorPhotoUrl: typeof payload.actorPhotoUrl === "string" ? payload.actorPhotoUrl : null,
        messagePreview: typeof payload.messagePreview === "string" ? payload.messagePreview : null,
    }
}

/**
 * A rota da conversa a partir do push, ou `null` se o push não for de chat.
 *
 * Devolve a rota em vez de navegar: quem sabe se a navegação já montou — e se o chat está
 * disponível — é quem chama, não este arquivo.
 */
export function chatRouteFromPush(data: unknown): string | null {
    const payload = asChatPush(data)
    if (!payload) return null
    return `/(tabs)/chat/${encodeURIComponent(payload.channelId)}`
}
