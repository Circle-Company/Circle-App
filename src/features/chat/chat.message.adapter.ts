import type { Attachment, LocalMessage, UserResponse } from "stream-chat"

import type {
    MessageAuthorProps,
    MessageContentType,
    MessageDeliveryStatus,
    MessageMediaProps,
    MessageMentionProps,
    MessageReactionProps,
    MessageReciveDataProps,
    MessageReplyProps,
} from "@/components/chat/message"

/**
 * A tradução do Stream para o modelo do componente de mensagem.
 *
 * **É a única peça que conhece os dois lados.** `src/components/chat/message/` não importa
 * `stream-chat`, e `chat.client.ts` não sabe o que é uma bolha — a costura mora aqui, e
 * trocar o backend de chat significa reescrever este arquivo e nada mais.
 */

/**
 * Tipo do anexo → tipo de conteúdo da mensagem.
 *
 * `voiceRecording` é como o Stream marca nota de voz (o client tem um
 * `isVoiceRecordingAttachment` interno); `audio` cobre um arquivo de áudio anexado à mão.
 * Os dois viram `audio`, porque para a bolha são a mesma coisa: um player.
 */
const ATTACHMENT_CONTENT_TYPE: Record<string, MessageContentType> = {
    voiceRecording: "audio",
    audio: "audio",
    image: "image",
    video: "video",
    file: "document",
}

/**
 * `status` do Stream → status de entrega da bolha.
 *
 * ⚠️ Nos tipos do pacote `status` é `string` livre, sem união nem constante exportada — os
 * valores abaixo vêm da convenção do Stream, não de uma declaração que dê para verificar.
 * Por isso o default é `sent` e não um `throw`: um valor inesperado deve virar uma bolha
 * normal, nunca sumir da conversa.
 *
 * `read` não sai daqui: uma mensagem só é "lida" em relação ao estado de leitura do canal,
 * que não está na mensagem. Quem tem essa informação passa `readByOthers` em `toMessageData`.
 */
const DELIVERY_STATUS: Record<string, MessageDeliveryStatus> = {
    sending: "pending",
    pending: "pending",
    failed: "failed",
    received: "sent",
    sent: "sent",
    delivered: "delivered",
}

const iso = (value: Date | string | null | undefined): string | null => {
    if (!value) return null
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString()
    return value
}

/** O Stream não tem `username`: `UserResponse` traz `id`, `name` e `image`. Um app que
 * grava `username` em dado customizado aparece aqui — por isso a leitura é defensiva. */
function toAuthor(user: UserResponse | null | undefined): MessageAuthorProps {
    const custom = (user ?? {}) as Record<string, unknown>
    const username =
        typeof custom.username === "string" && custom.username ? custom.username : undefined

    return {
        id: String(user?.id ?? ""),
        username: username ?? user?.name ?? String(user?.id ?? ""),
        name: user?.name ?? null,
        profilePicture: user?.image ?? null,
    }
}

function toContentType(message: Pick<LocalMessage, "type" | "attachments">): MessageContentType {
    if (message.type === "system") return "system"

    const attachment = message.attachments?.[0]
    const mapped = attachment?.type ? ATTACHMENT_CONTENT_TYPE[attachment.type] : undefined
    return mapped ?? "text"
}

function toMedia(attachment: Attachment | undefined): MessageMediaProps | undefined {
    if (!attachment) return undefined

    const url = attachment.asset_url || attachment.image_url || attachment.thumb_url
    if (!url) return undefined

    const fileSize =
        typeof attachment.file_size === "number"
            ? attachment.file_size
            : typeof attachment.file_size === "string"
              ? Number(attachment.file_size) || undefined
              : undefined

    return {
        url,
        width: attachment.original_width,
        height: attachment.original_height,
        duration: attachment.duration,
        // O Stream já entrega as amplitudes normalizadas da nota de voz. Quando vêm, o
        // componente não precisa baixar e decodificar o arquivo para desenhar o traço.
        waveform: attachment.waveform_data,
        fileName: attachment.title,
        fileSize,
        mimeType: attachment.mime_type,
        thumbnailUrl: attachment.thumb_url,
    }
}

/**
 * Menções, com os índices que o componente precisa.
 *
 * O Stream entrega `mentioned_users` — **quem** foi mencionado — mas não **onde**, e o
 * componente destaca por posição no texto cru. Então os índices são recalculados aqui,
 * procurando `@nome` no texto.
 *
 * A busca é por ocorrência: se a mesma pessoa é mencionada duas vezes, as duas são
 * destacadas. Quem não for encontrado no texto simplesmente não vira menção — melhor uma
 * menção sem destaque que um índice errado destacando o pedaço errado da frase.
 */
function toMentions(text: string, users: UserResponse[] | undefined): MessageMentionProps[] {
    if (!text || !users?.length) return []

    const mentions: MessageMentionProps[] = []

    for (const user of users) {
        const author = toAuthor(user)
        for (const handle of [author.username, author.name].filter(Boolean) as string[]) {
            const needle = `@${handle}`
            let from = 0
            let index = text.indexOf(needle, from)
            while (index !== -1) {
                mentions.push({
                    start: index,
                    end: index + needle.length,
                    userId: author.id,
                    username: author.username,
                })
                from = index + needle.length
                index = text.indexOf(needle, from)
            }
            // Achou por este identificador: não procura pelo outro, senão a mesma menção
            // entraria duas vezes.
            if (mentions.some((mention) => mention.userId === author.id)) break
        }
    }

    return mentions.sort((a, b) => a.start - b.start)
}

/**
 * Reações agregadas.
 *
 * Vem de `reaction_groups` (a contagem por emoji) cruzado com `own_reactions` (as do
 * usuário logado). `reaction_counts` é o formato antigo e continua sendo lido como plano B.
 */
function toReactions(message: LocalMessage): MessageReactionProps[] {
    const own = new Set((message.own_reactions ?? []).map((reaction) => reaction.type))

    const groups = message.reaction_groups
    if (groups) {
        return Object.entries(groups)
            .filter(([, group]) => (group?.count ?? 0) > 0)
            .map(([emoji, group]) => ({
                emoji,
                count: group.count,
                reactedByMe: own.has(emoji),
            }))
    }

    const counts = message.reaction_counts
    if (!counts) return []

    return Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([emoji, count]) => ({ emoji, count, reactedByMe: own.has(emoji) }))
}

function toReply(message: LocalMessage): MessageReplyProps | null {
    const quoted = message.quoted_message
    if (!quoted) return null

    const contentType = toContentType(quoted)

    return {
        id: quoted.id,
        author: toAuthor(quoted.user),
        // A citação mostra o texto; sem texto (uma nota de voz, por exemplo) o componente
        // ainda tem o `contentType` para decidir o que escrever no lugar.
        preview: quoted.text ?? "",
        contentType,
        edited: Boolean(quoted.message_text_updated_at),
    }
}

export type ToMessageDataOptions = {
    /**
     * A mensagem já foi lida por outra pessoa da conversa.
     *
     * Chega de fora porque leitura é estado do **canal**, não da mensagem: quem sabe é quem
     * tem o `channel.state.read`. Sem isso, o status máximo que uma mensagem própria alcança
     * é `delivered`.
     */
    readByOthers?: boolean
}

/** Uma mensagem do Stream no formato que `Message.Render` consome. */
export function toMessageData(
    message: LocalMessage,
    { readByOthers = false }: ToMessageDataOptions = {},
): MessageReciveDataProps {
    const deletedAt = iso(message.deleted_at)
    const text = message.text ?? null
    const contentType = toContentType(message)
    const status = DELIVERY_STATUS[message.status] ?? "sent"

    return {
        id: message.id,
        chatId: message.cid ?? "",
        author: toAuthor(message.user),
        contentType,
        content: text,
        media: toMedia(message.attachments?.[0]),
        mentions: toMentions(text ?? "", message.mentioned_users),
        reactions: toReactions(message),
        replyTo: toReply(message),
        // A promoção para `read` só acontece sobre um estado já entregue: uma mensagem que
        // falhou não vira lida porque o canal foi lido.
        status: readByOthers && status === "sent" ? "read" : status,
        createdAt: iso(message.created_at) ?? new Date(0).toISOString(),
        editedAt: message.message_text_updated_at ?? null,
        deletedAt,
        pinned: Boolean(message.pinned),
    }
}

/** Converte a lista inteira, preservando a ordem cronológica que o Stream já entrega. */
export function toMessageList(
    messages: LocalMessage[],
    options: ToMessageDataOptions = {},
): MessageReciveDataProps[] {
    return messages.map((message) => toMessageData(message, options))
}
