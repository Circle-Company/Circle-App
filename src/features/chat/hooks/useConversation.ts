import React from "react"
import { AppState } from "react-native"
import type { Channel, Event, LocalMessage } from "stream-chat"

import type { MessageReciveDataProps } from "@/components/chat/message"
import { useChat } from "@/contexts/Chat"

import { type ChatPeer, getChatPeer } from "../chat.channel.adapter"
import { toMessageData } from "../chat.message.adapter"
import { useEventVersion } from "./useEventVersion"

/** Mensagens por página, na abertura e a cada subida. */
const PAGE = 30

/** Eventos que mudam o que a conversa desenha. */
const CONVERSATION_EVENTS = new Set([
    "message.new",
    "message.updated",
    "message.deleted",
    "message.read",
    "user.presence.changed",
    "user.updated",
])

/**
 * Uma mensagem que ainda não voltou do servidor.
 *
 * Vive fora do SDK — é a única coisa nesta camada que **não** está no `channel.state`, e é
 * por isso que existe: entre tocar em "enviar" e o servidor confirmar há um intervalo em que
 * a mensagem só existe aqui, e a conversa precisa mostrá-la nesse intervalo.
 */
type PendingMessage = {
    id: string
    text: string
    createdAt: string
    failed: boolean
}

export type Conversation = {
    ready: boolean
    /** As mensagens no formato do componente, já em ordem cronológica. */
    messages: MessageReciveDataProps[]
    peer: ChatPeer | null
    hasOlder: boolean
    loadingOlder: boolean
    loadOlder: () => void
    /** Envia. Passe `retryId` para reenviar uma que falhou — o mesmo id, sem duplicar. */
    send: (text: string, retryId?: string) => void
    markRead: () => void
    channel: Channel | null
}

export type UseConversationOptions = {
    /** A conversa deixou de existir: apagada, ou sem acesso (amizade desfeita). */
    onGone: () => void
}

/**
 * O estado de uma conversa aberta.
 *
 * Lê do `channel.state` a cada evento em vez de manter uma cópia — ver `useEventVersion`. O
 * único estado próprio é a fila de pendentes, porque ela descreve algo que o servidor ainda
 * não sabe.
 */
export function useConversation(
    channelId: string,
    { onGone }: UseConversationOptions,
): Conversation {
    const { client } = useChat()
    const myUserId = client?.userID ? String(client.userID) : ""

    const [channel, setChannel] = React.useState<Channel | null>(null)
    const [loadingOlder, setLoadingOlder] = React.useState(false)
    const [pending, setPending] = React.useState<PendingMessage[]>([])
    const loadingOlderRef = React.useRef(false)

    // `onGone` costuma ser um literal na tela; numa dependência, ele remontaria o canal a
    // cada render — desinscrevendo e reinscrevendo o WebSocket sem motivo.
    const onGoneRef = React.useRef(onGone)
    // Espelho da última prop, escrito no render pelo mesmo motivo de `useEventVersion`: o
    // canal pode ser apagado antes de o efeito rodar, e a ref precisa estar em dia.
    // eslint-disable-next-line react-hooks/refs
    onGoneRef.current = onGone

    /*
     * Abre e observa o canal.
     *
     * O `watch` faz as duas coisas de uma vez: baixa a última página e inscreve o canal nos
     * eventos. Falhar aqui é o caso de amizade desfeita — o canal foi apagado, ou o acesso
     * revogado —, e a tela deve sair em vez de mostrar uma conversa vazia.
     */
    React.useEffect(() => {
        if (!client || !channelId) return

        const target = client.channel("messaging", stripType(channelId))
        let cancelled = false

        target
            .watch({ messages: { limit: PAGE }, presence: true })
            .then(() => {
                if (cancelled) return
                setChannel(target)
            })
            .catch((error) => {
                if (cancelled) return
                if (__DEV__) console.warn("[chat] não foi possível abrir a conversa:", error)
                onGoneRef.current()
            })

        const subscription = target.on("channel.deleted", () => onGoneRef.current())

        return () => {
            cancelled = true
            subscription.unsubscribe()
            // Sem isto o canal continua entregando eventos depois que a tela saiu: o socket é
            // um só para o app inteiro, e cada conversa visitada ficaria inscrita para sempre.
            target.stopWatching().catch(() => {})
        }
    }, [client, channelId])

    /*
     * Re-render por evento, com um efeito colateral: a confirmação da própria mensagem tira
     * a versão otimista da fila. O id é o mesmo dos dois lados (foi gerado aqui), então a
     * troca acontece sem a bolha piscar.
     */
    const version = useEventVersion(channel, (event: Event) => {
        if (event.type === "message.new" && event.message?.id) {
            const confirmedId = event.message.id
            setPending((previous) => previous.filter((item) => item.id !== confirmedId))
        }
        return CONVERSATION_EVENTS.has(event.type)
    })

    /**
     * Ainda há passado a carregar.
     *
     * Quem responde é o SDK, não uma contagem nossa: ele acompanha a paginação de cada
     * conjunto de mensagens em `messagePagination`. A heurística óbvia — "a página veio
     * cheia, então deve haver mais" — erra justamente no fim da conversa, quando o último
     * lote tem exatamente o tamanho da página e a lista fica tentando carregar o que não
     * existe.
     */
    const hasOlder = React.useMemo(
        () => (channel ? channel.state.messagePagination.hasPrev : false),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [channel, version, loadingOlder],
    )

    const loadOlder = React.useCallback(() => {
        if (!channel || loadingOlderRef.current) return
        if (!channel.state.messagePagination.hasPrev) return

        const oldest = channel.state.messages[0]
        if (!oldest) return

        loadingOlderRef.current = true
        setLoadingOlder(true)

        // `id_lt` e não offset: a conversa recebe mensagens novas enquanto se sobe, e um
        // offset numérico deslizaria a cada chegada, repetindo ou pulando mensagens.
        //
        // O resultado não é usado porque não precisa ser: `query` chama `_initializeState`
        // por dentro, então as mensagens já entraram em `channel.state.messages` — e a
        // paginação foi atualizada junto.
        channel
            .query({ messages: { limit: PAGE, id_lt: oldest.id } })
            .catch(() => {})
            .finally(() => {
                loadingOlderRef.current = false
                setLoadingOlder(false)
            })
    }, [channel])

    const send = React.useCallback(
        (text: string, retryId?: string) => {
            const trimmed = text.trim()
            if (!channel || !myUserId || !trimmed) return

            /*
             * O id é gerado **aqui**, e é isso que torna o reenvio seguro: o Stream trata o
             * mesmo id como a mesma mensagem, então tentar de novo depois de um timeout não
             * corre o risco de publicar duas vezes o que talvez já tenha chegado.
             */
            const id = retryId ?? `${myUserId}-${localMessageId()}`

            setPending((previous) => [
                ...previous.filter((item) => item.id !== id),
                { id, text: trimmed, createdAt: new Date().toISOString(), failed: false },
            ])

            channel
                .sendMessage({ id, text: trimmed })
                .then(() => {
                    setPending((previous) => previous.filter((item) => item.id !== id))
                })
                .catch(() => {
                    // Fica na lista, marcada — some da tela seria perder o texto que a pessoa
                    // escreveu, que é o pior desfecho possível de uma falha de envio.
                    setPending((previous) =>
                        previous.map((item) => (item.id === id ? { ...item, failed: true } : item)),
                    )
                })
        },
        [channel, myUserId],
    )

    /**
     * Marca a conversa como lida.
     *
     * **Sem os componentes do SDK, `watch()` não faz isso sozinho.** É esta chamada que zera
     * o badge da aba e o contador da célula no grid — e que faz o outro lado ver o ✓✓.
     */
    const markRead = React.useCallback(() => {
        if (!channel || channel.countUnread() === 0) return
        channel.markRead().catch(() => {})
    }, [channel])

    // Mensagem que chega com a tela aberta e o app em primeiro plano já nasce lida: o
    // usuário está olhando para ela.
    React.useEffect(() => {
        if (!channel) return

        const subscription = channel.on("message.new", (event: Event) => {
            const from = event.user?.id
            if (from !== undefined && String(from) === myUserId) return
            if (AppState.currentState !== "active") return
            markRead()
        })

        return () => subscription.unsubscribe()
    }, [channel, markRead, myUserId])

    const messages = React.useMemo<MessageReciveDataProps[]>(() => {
        if (!channel || !myUserId) return []

        const readAt = peerLastRead(channel, myUserId)

        const confirmed = channel.state.messages.map((message) =>
            toMessageData(message as LocalMessage, {
                readByOthers: isReadByPeer(message as LocalMessage, myUserId, readAt),
            }),
        )

        const confirmedIds = new Set(confirmed.map((message) => message.id))

        // As pendentes vão no fim porque são, por definição, as mais recentes. O filtro cobre
        // a janela entre a confirmação chegar e o `setPending` do listener rodar.
        const optimistic = pending
            .filter((item) => !confirmedIds.has(item.id))
            .map<MessageReciveDataProps>((item) => ({
                id: item.id,
                chatId: channel.cid,
                author: { id: myUserId, username: "", name: null, profilePicture: null },
                contentType: "text",
                content: item.text,
                mentions: [],
                reactions: [],
                replyTo: null,
                status: item.failed ? "failed" : "pending",
                createdAt: item.createdAt,
                editedAt: null,
                deletedAt: null,
                pinned: false,
            }))

        return [...confirmed, ...optimistic]
        // `version` é a dependência que traduz evento do WebSocket em recálculo.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channel, myUserId, pending, version])

    const peer = channel && myUserId ? getChatPeer(channel, myUserId) : null

    return {
        ready: Boolean(channel),
        messages,
        peer,
        hasOlder,
        loadingOlder,
        loadOlder,
        send,
        markRead,
        channel,
    }
}

/**
 * Um id único para a mensagem sendo enviada.
 *
 * Não é UUID, e não precisa ser: o id já é prefixado com o id do usuário, e o que se exige
 * dele é não colidir com **outra mensagem minha** — o Stream usa isso para não duplicar um
 * reenvio. Timestamp mais aleatório resolve isso sem trazer `expo-crypto`, que é módulo
 * nativo e exigiria um build novo só para gerar uma string.
 */
function localMessageId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Aceita `messaging:abc` ou `abc`.
 *
 * O `cid` completo é o que circula pela navegação e pelo grid; o `channel()` do SDK quer só
 * o id. Normalizar aqui evita que cada chamador lembre da diferença.
 */
export function stripType(channelId: string): string {
    const separator = channelId.indexOf(":")
    return separator === -1 ? channelId : channelId.slice(separator + 1)
}

/** Até quando o outro participante leu a conversa. `null` quando nunca leu. */
function peerLastRead(channel: Channel, myUserId: string): number | null {
    for (const [userId, state] of Object.entries(channel.state.read)) {
        if (String(userId) === myUserId) continue
        const lastRead = state?.last_read
        if (lastRead) return new Date(lastRead).getTime()
    }
    return null
}

/**
 * A mensagem já foi lida pelo outro lado.
 *
 * Comparação por horário, e não por um campo da mensagem, porque leitura é estado do
 * **canal**: o Stream guarda "fulano leu até tal momento", não "esta mensagem foi lida".
 * Só faz sentido para as minhas — o ✓✓ é sobre o que eu enviei.
 */
function isReadByPeer(message: LocalMessage, myUserId: string, readAt: number | null): boolean {
    if (readAt === null) return false
    if (message.user?.id === undefined || String(message.user.id) !== myUserId) return false

    const createdAt = message.created_at ? new Date(message.created_at).getTime() : NaN
    return !Number.isNaN(createdAt) && readAt >= createdAt
}
