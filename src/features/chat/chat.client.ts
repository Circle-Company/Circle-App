import { StreamChat, type TokenProvider } from "stream-chat"

/**
 * O client do Stream Chat.
 *
 * **É o `stream-chat` puro, sem UI.** A camada visual do chat é toda nossa
 * (`src/features/chat/`), então nada do `stream-chat-expo` entra aqui — o que também evita
 * o pacote de UI e suas dependências nativas. O `stream-chat` é JavaScript puro: declara
 * condição de export `react-native` e não exige `prebuild`.
 *
 * Ver `docs/chat-stream-implementation.md`.
 */

export type ChatConnectParams = {
    apiKey: string
    /** Mesmo id do usuário no Circle — ver §5 do documento. */
    userId: string
    /**
     * O token, ou uma função que o busca.
     *
     * **Prefira a função.** O token expira, e o client a chama de novo sozinho quando isso
     * acontece; com uma string fixa, a sessão do chat simplesmente morre e só volta com um
     * reinício do app.
     */
    token: string | TokenProvider
    name?: string
    image?: string
}

/**
 * `getInstance` e não `new StreamChat()`: a própria documentação avisa que o construtor é
 * para uso avançado, porque duas instâncias abrem duas conexões WebSocket para o mesmo
 * usuário — o servidor conta as duas, e os eventos chegam duplicados na UI.
 */
export function getChatClient(apiKey: string): StreamChat {
    return StreamChat.getInstance(apiKey)
}

/**
 * Estado da conexão em curso.
 *
 * Existe por causa do strict mode do React 19: em desenvolvimento os efeitos montam, limpam e
 * remontam, e sem esta guarda o segundo mount dispararia um `connectUser` com o primeiro
 * ainda em voo. Duas conexões concorrentes para o mesmo usuário é exatamente o que o
 * `getInstance` acima existe para evitar.
 */
let connecting: Promise<StreamChat> | null = null
let connectedUserId: string | null = null

/**
 * A instância que conectamos.
 *
 * Guardada aqui, e não relida de `getInstance`, porque `getInstance` **ignora a key quando já
 * existe instância**: ele devolve o singleton independentemente do argumento, e criaria um
 * client com key vazia se nenhuma existisse ainda. Uma referência própria não depende desse
 * detalhe.
 */
let client: StreamChat | null = null

/**
 * Conecta o usuário e devolve o client pronto.
 *
 * Chamadas concorrentes compartilham a mesma promise — o mesmo padrão de single-flight que a
 * `Session` usa no refresh (`src/session/session.ts`), e pela mesma razão: N chamadores, uma
 * operação de rede.
 */
export async function connectChatUser({
    apiKey,
    userId,
    token,
    name,
    image,
}: ChatConnectParams): Promise<StreamChat> {
    const instance = getChatClient(apiKey)
    client = instance

    // Já conectado como esta pessoa: nada a fazer. Reconectar derrubaria o WebSocket vivo e
    // recarregaria tudo sem necessidade.
    if (connectedUserId === userId && instance.userID === userId) return instance

    if (connecting) return connecting

    // Trocou de usuário no mesmo aparelho (§2.6 do guard de identidade): a conexão anterior
    // precisa morrer antes, senão o WebSocket antigo continua entregando eventos da conta
    // que acabou de sair.
    if (connectedUserId && connectedUserId !== userId) {
        await disconnectChatUser()
    }

    connecting = instance
        .connectUser({ id: userId, name, image }, token)
        .then(() => {
            connectedUserId = userId
            return instance
        })
        .finally(() => {
            connecting = null
        })

    return connecting
}

/**
 * Desconecta e esquece o usuário.
 *
 * **Precisa ser chamado no logout do Circle** (`signOut` em `src/contexts/auth.tsx`). Sem
 * isso o WebSocket do chat sobrevive ao logout: a sessão do app morre e a do Stream continua
 * viva, entregando mensagens de uma conta que já saiu do aparelho.
 */
export async function disconnectChatUser(): Promise<void> {
    const instance = client
    connectedUserId = null
    connecting = null
    if (!instance) return

    try {
        await instance.disconnectUser()
    } catch (error) {
        // Best-effort, como o `signOut` do app: rede caída não pode travar um logout.
        console.warn("Falha ao desconectar o chat:", error)
    }
}

/** Quem está conectado agora, ou `null`. Útil para guardas de UI sem tocar no client. */
export function getConnectedChatUserId(): string | null {
    return connectedUserId
}
