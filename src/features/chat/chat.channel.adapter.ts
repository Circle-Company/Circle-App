import type { Channel, UserResponse } from "stream-chat"

import type { ChatPreview } from "./chat.types"

/**
 * A tradução de `Channel` do Stream para o modelo do grid.
 *
 * Companheiro de `chat.message.adapter.ts`, e pelo mesmo motivo: `src/components/chat/` e as
 * telas não importam `stream-chat`. Uma conversa vira `ChatPreview` aqui, e nada além desta
 * pasta precisa saber o que é um `Channel`.
 */

/** O outro participante de uma conversa, do jeito que a UI precisa dele. */
export type ChatPeer = {
    id: string
    username: string
    name: string | null
    profilePicture: string | null
    online: boolean
    /** Última vez visto. Reflete conexão com o **chat**, não uso do app. */
    lastActiveAt: string | null
}

function toPeer(user: UserResponse | undefined): ChatPeer | null {
    if (!user) return null

    // O Stream não tem `username`: o backend grava o do Circle em `name`. Um app que também
    // mande `username` como dado customizado aparece aqui — por isso a leitura é defensiva,
    // como no adaptador de mensagem.
    const custom = user as unknown as Record<string, unknown>
    const username =
        typeof custom.username === "string" && custom.username ? custom.username : undefined

    return {
        id: String(user.id),
        username: username ?? user.name ?? String(user.id),
        name: user.name ?? null,
        profilePicture: (user.image as string | undefined) ?? null,
        online: Boolean(user.online),
        lastActiveAt: user.last_active ?? null,
    }
}

/**
 * O outro lado da conversa.
 *
 * Numa DM é o membro cujo id não é o meu — e é assim, e não pelo primeiro membro da lista,
 * porque a ordem dos membros não é garantida: metade das conversas mostraria o próprio
 * usuário como interlocutor.
 */
export function getChatPeer(channel: Channel, myUserId: string): ChatPeer | null {
    const me = String(myUserId)
    const member = Object.values(channel.state.members).find(
        (candidate) => candidate.user?.id !== undefined && String(candidate.user.id) !== me,
    )
    return toPeer(member?.user)
}

/**
 * Uma conversa como a célula do grid precisa dela.
 *
 * `awaitingReply` não é `unread > 0`, e a diferença importa: dá para ter lido a mensagem e
 * ainda não ter respondido. É esse caso — conversa lida e sem resposta — que o balão da
 * célula existe para lembrar.
 */
export function toChatPreview(channel: Channel, myUserId: string): ChatPreview {
    const me = String(myUserId)
    const peer = getChatPeer(channel, me)
    const last = channel.state.latestMessages.at(-1)
    const lastIsMine = last?.user?.id !== undefined && String(last.user.id) === me

    return {
        cid: channel.cid,
        peerId: peer?.id,
        name: peer?.name ?? peer?.username ?? "",
        profilePicture: peer?.profilePicture ?? undefined,
        // Mensagem removida pela moderação continua ocupando a última posição: sem o texto de
        // substituição a célula mostraria a mensagem **anterior**, como se a remoção não
        // tivesse acontecido.
        lastMessage: last
            ? last.type === "deleted"
                ? undefined
                : (last.text ?? undefined)
            : undefined,
        unread: channel.countUnread(),
        awaitingReply: Boolean(last) && !lastIsMine,
        online: peer?.online ?? false,
    }
}

/** `true` quando a conversa foi aberta mas ninguém falou nada — o grid não a mostra. */
export function hasMessages(channel: Channel): boolean {
    return channel.state.latestMessages.length > 0
}
