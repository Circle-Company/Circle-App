/**
 * Os modelos de view do chat.
 *
 * **Nenhum tipo daqui importa do `stream-chat-expo`, e isso é deliberado.** O SDK ainda não
 * está instalado (ver `docs/chat-stream-implementation.md` §6), e a compatibilidade dele com
 * esta stack — Expo 56 / RN 0.85 / React 19 / Reanimated 4 — é o risco nº 1 do plano, ainda
 * não validado. Amarrar a camada visual aos tipos do SDK agora significaria não poder
 * renderizar nada até esse risco fechar.
 *
 * O contrato é o inverso: a UI define o que precisa, e um adaptador — a escrever quando o
 * client existir — traduz `Channel`/`LocalMessage` do Stream para estes tipos. É a única
 * peça que vai conhecer o SDK.
 */

/** Uma conversa como a célula do grid precisa dela. */
export type ChatPreview = {
    /** `cid` do canal no Stream (`messaging:xyz`). Chave da lista e da rota. */
    cid: string
    /** Nome do outro participante numa DM. */
    name: string
    profilePicture?: string
    /** Texto da última mensagem. `undefined` quando a conversa está vazia. */
    lastMessage?: string
    /** Não lidas do usuário atual nesta conversa. Alimenta o badge vermelho. */
    unread: number
    /**
     * `true` quando a última mensagem é da outra pessoa — ou seja, está sem resposta.
     *
     * É o que decide se a célula mostra o balão. Não é o mesmo que `unread > 0`: dá para ter
     * lido a mensagem e ainda não ter respondido, e é justamente esse caso que o balão
     * precisa lembrar.
     */
    awaitingReply?: boolean
    online?: boolean
}
