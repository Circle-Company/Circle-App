/**
 * Contrato das três rotas de chat do nosso backend.
 *
 * O que **não** está aqui: mensagem, canal, membro, presença. Isso é do Stream, e o app lê
 * direto do SDK (ver `docs/chat-frontend-guide.md` §5). Nosso backend só entrega credencial,
 * abre conversa e sincroniza perfil — três chamadas, e nada mais passa por HTTP.
 */

export type ChatTokenResponse = {
    apiKey: string
    /** Mesmo id do usuário no Circle. Snowflake em string — nunca `Number(...)`. */
    userId: string
    token: string
    /** ISO. O token vale 1 hora; quem renova é o `tokenProvider` do SDK. */
    expiresAt: string
}

export type OpenDirectChannelResponse = {
    channelId: string
    channelType: "messaging"
    memberIds: string[]
}

export type SyncChatUsersResponse = {
    success: boolean
}
