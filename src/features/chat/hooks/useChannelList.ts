import React from "react"
import type { Channel, Event } from "stream-chat"

import { apiRoutes } from "@/api"
import { useChat } from "@/contexts/Chat"

import { hasMessages, toChatPreview } from "../chat.channel.adapter"
import type { ChatPreview } from "../chat.types"
import { useEventVersion } from "./useEventVersion"

/** Limite por página do provedor. O offset máximo aceito é 1000. */
const PAGE = 30

/**
 * Eventos que mudam o **conteúdo** de uma linha já visível: prévia, não-lidas, ponto de
 * online, nome, silenciado. Não mexem em quem está na lista nem na ordem — para isso há o
 * outro efeito, que mexe no array.
 */
const ROW_EVENTS = new Set([
    "message.new",
    "message.updated",
    "message.deleted",
    "message.read",
    "notification.mark_read",
    "user.presence.changed",
    "user.updated",
    "channel.updated",
    "notification.channel_mutes_updated",
])

export type ChannelList = {
    items: ChatPreview[]
    loading: boolean
    hasMore: boolean
    loadMore: () => void
    refresh: () => void
}

/**
 * A lista de conversas do hub.
 *
 * **Não existe endpoint nosso para isto**, e nem deveria: quem tem a lista, a ordem e as
 * não-lidas é o Stream. O que existe são as conversas **já abertas** ao menos uma vez — a
 * criação é lazy (§7). Uma pessoa sem nenhuma conversa vê o estado vazio, e o caminho para
 * a primeira é a lista de amigos, não esta lista.
 */
export function useChannelList(): ChannelList {
    const { client, status } = useChat()
    const myUserId = client?.userID ? String(client.userID) : ""

    const [channels, setChannels] = React.useState<Channel[]>([])
    const [loading, setLoading] = React.useState(true)
    const [hasMore, setHasMore] = React.useState(true)
    const loadingMore = React.useRef(false)

    const query = React.useCallback(
        (offset: number) => {
            if (!client || !myUserId) return Promise.resolve<Channel[]>([])

            return client.queryChannels(
                { type: "messaging", members: { $in: [myUserId] } },
                [{ last_message_at: -1 }],
                {
                    limit: PAGE,
                    offset,
                    // `watch` inscreve o canal nos eventos: sem isto a lista carrega uma vez
                    // e congela — mensagem nova não sobe a conversa nem incrementa o badge.
                    watch: true,
                    // `presence` é o que traz (e mantém) o ponto verde de quem está online.
                    presence: true,
                    state: true,
                },
            )
        },
        [client, myUserId],
    )

    const refresh = React.useCallback(() => {
        if (!client || !myUserId) return

        query(0)
            .then((first) => {
                setChannels(first)
                setHasMore(first.length === PAGE)
            })
            .catch((error) => {
                if (__DEV__) console.warn("[chat] falha ao carregar conversas:", error)
            })
            .finally(() => setLoading(false))
    }, [client, myUserId, query])

    const loadMore = React.useCallback(() => {
        if (!hasMore || loadingMore.current) return
        loadingMore.current = true

        // O offset é o tamanho atual da lista, não um número de página: canais entram e saem
        // do topo o tempo todo, e contar páginas pularia ou repetiria conversas.
        query(channels.length)
            .then((next) => {
                setChannels((previous) => dedupe([...previous, ...next]))
                setHasMore(next.length === PAGE)
            })
            .catch(() => {})
            .finally(() => {
                loadingMore.current = false
            })
    }, [channels.length, hasMore, query])

    React.useEffect(() => {
        if (status !== "ready") return
        refresh()
    }, [status, refresh])

    /*
     * Mudanças na **composição** da lista: quem entra, quem sai, quem sobe para o topo.
     *
     * Separado do re-render de conteúdo porque aqui o array muda de fato, e cada caso tem um
     * tratamento diferente — reordenar não é o mesmo que inscrever um canal novo.
     */
    React.useEffect(() => {
        if (!client) return

        const subscription = client.on((event: Event) => {
            switch (event.type) {
                case "message.new":
                    setChannels((previous) => moveToTop(previous, event.cid))
                    break

                case "notification.message_new":
                case "notification.added_to_channel": {
                    // Conversa que ainda não estava sendo observada — o amigo acabou de abrir
                    // a primeira conversa com você. Chega por `notification.*` justamente
                    // porque `message.new` só alcança canais já inscritos.
                    const incoming = event.channel
                    if (!incoming?.id) break

                    const channel = client.channel(incoming.type, incoming.id)
                    channel
                        .watch()
                        .then(() => setChannels((previous) => dedupe([channel, ...previous])))
                        .catch(() => {})
                    break
                }

                case "channel.deleted":
                case "notification.channel_deleted":
                case "channel.hidden":
                    // Amizade desfeita ou conta excluída (§12): a conversa some do hub.
                    setChannels((previous) => previous.filter((c) => c.cid !== event.cid))
                    break

                case "connection.recovered":
                    // Voltou do background ou da rede: a primeira página pode ter mudado
                    // enquanto o socket estava fechado.
                    refresh()
                    break
            }
        })

        return () => subscription.unsubscribe()
    }, [client, refresh])

    // Mudanças no conteúdo das linhas: nada a reordenar, só redesenhar.
    const version = useEventVersion(client, (event) => ROW_EVENTS.has(event.type))

    const items = React.useMemo(() => {
        if (!myUserId) return []
        // `hasMessages` filtra a conversa aberta e nunca usada: ela existe no Stream desde o
        // `POST /chat/channels/direct`, mas uma conversa sem nenhuma mensagem não é uma
        // conversa para quem olha o grid.
        return channels.filter(hasMessages).map((channel) => toChatPreview(channel, myUserId))
        // `version` entra de propósito: é o que traduz "chegou evento" em "recalcule".
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channels, myUserId, version])

    return { items, loading, hasMore, loadMore, refresh }
}

/**
 * Sincroniza nome e foto dos interlocutores, uma vez por abertura do hub.
 *
 * Rede de segurança, não caminho principal: o perfil é gravado no Stream quando cada pessoa
 * emite token. Quem nunca abriu o chat depois de trocar a foto ficaria com a antiga na
 * célula de quem conversa com ela — é esse buraco que isto fecha.
 */
export function usePeerProfileSync(items: ChatPreview[]): void {
    const done = React.useRef(false)

    React.useEffect(() => {
        if (done.current || items.length === 0) return
        done.current = true

        const userIds = [
            ...new Set(items.map((item) => item.peerId).filter((id): id is string => Boolean(id))),
        ]

        if (userIds.length === 0) return
        // Best-effort: uma foto desatualizada não justifica um erro na tela.
        apiRoutes.chat.syncUsers({ userIds }).catch(() => {})
    }, [items])
}

/** Sobe a conversa para o topo. Devolve a mesma lista quando ela já está lá. */
function moveToTop(list: Channel[], cid?: string): Channel[] {
    const index = list.findIndex((channel) => channel.cid === cid)
    if (index <= 0) return list

    const copy = [...list]
    const [channel] = copy.splice(index, 1)
    return [channel, ...copy]
}

/** Remove repetidos preservando a ordem — o mesmo canal pode chegar por duas vias. */
function dedupe(list: Channel[]): Channel[] {
    const seen = new Set<string>()
    return list.filter((channel) => {
        if (seen.has(channel.cid)) return false
        seen.add(channel.cid)
        return true
    })
}
