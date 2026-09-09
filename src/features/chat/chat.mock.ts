import type { ChatBubbleMessage, ChatPreview } from "./chat.types"

/**
 * Dados falsos para desenvolver a tela antes de o SDK existir.
 *
 * **Só é consumido sob `__DEV__`** (ver `app/(tabs)/chat/index.tsx`) — nada disto pode
 * aparecer num build de produção. Não tem relação com o backend: não cria usuário nem canal
 * no Stream, é só memória local.
 *
 * A escolha das entradas não é aleatória. Cada uma cobre um caso que o layout precisa
 * aguentar:
 *
 *   - balão com `+X`: Marina (`+1`), Duda (`+4`), Lucas (`+11`, dois dígitos);
 *   - balão sem `+X`: uma única não lida ou nenhuma — Rafael, Bia;
 *   - não lida sem balão: Joana. Sem badge, o único sinal é o nome em branco e semibold;
 *   - nada: conversa em dia — Alexandre, Tom.
 *
 * Além disso: mensagem longa demais para duas linhas (que é o caso em que o `+X` precisa
 * sobreviver às reticências), usuário sem foto, conversa sem nenhuma mensagem, e nome
 * comprido demais para a largura da célula.
 *
 * As fotos vêm de um serviço público de avatar de placeholder; sem rede, cada uma cai no
 * fallback de inicial — o que também é um caso que vale ver.
 */

const avatar = (id: number) => `https://i.pravatar.cc/300?img=${id}`

export const MOCK_CONVERSATIONS: ChatPreview[] = [
    {
        cid: "messaging:mock-1",
        name: "Marina",
        profilePicture: avatar(5),
        lastMessage: "vamos hoje?",
        unread: 2,
        awaitingReply: true,
        online: true,
    },
    {
        cid: "messaging:mock-2",
        name: "Rafael",
        profilePicture: avatar(12),
        // Longa de propósito: precisa cortar em duas linhas sem empurrar a célula.
        lastMessage:
            "cara, acabei de ver o moment que você postou ontem à noite e fiquei pensando naquilo o dia inteiro",
        unread: 0,
        awaitingReply: true,
    },
    {
        cid: "messaging:mock-3",
        name: "Bia",
        profilePicture: avatar(9),
        lastMessage: "kkkkkk",
        unread: 0,
        awaitingReply: true,
        online: true,
    },
    {
        cid: "messaging:mock-4",
        // Sem foto: exercita o fallback com a inicial.
        name: "Joana",
        // Última mensagem minha: sem balão. Só o nome em destaque sinaliza a não lida.
        lastMessage: "te mando depois",
        unread: 1,
    },
    {
        cid: "messaging:mock-5",
        // Nome comprido: precisa cortar em uma linha só.
        name: "Alexandre Monteiro",
        profilePicture: avatar(33),
        lastMessage: "beleza",
        unread: 0,
    },
    {
        cid: "messaging:mock-6",
        // Conversa sem nenhuma mensagem: sem balão, sem badge.
        name: "Tom",
        profilePicture: avatar(60),
        unread: 0,
        online: true,
    },
    {
        cid: "messaging:mock-7",
        name: "Duda",
        profilePicture: avatar(24),
        lastMessage: "chego em 10",
        unread: 5,
        awaitingReply: true,
    },
    {
        cid: "messaging:mock-8",
        name: "Lucas",
        profilePicture: avatar(51),
        // Contagem alta: exercita o `+X` de dois dígitos dentro do balão.
        lastMessage: "😂😂",
        unread: 12,
        awaitingReply: true,
    },
]

const AT = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000).toISOString()

/**
 * Mensagens por conversa, para a tela de conversa ter o que renderizar ao tocar numa célula.
 *
 * A primeira conversa tem blocos encadeados dos dois lados de propósito: é o que permite ver
 * o agrupamento do `groupMessages` funcionando — cantos internos retos e rabinho só na última
 * bolha do bloco.
 */
export const MOCK_MESSAGES: Record<string, ChatBubbleMessage[]> = {
    "messaging:mock-1": [
        { id: "m1", text: "oi! tudo bem?", mine: false, createdAt: AT(50) },
        {
            id: "m2",
            text: "vi que você tá em são paulo essa semana",
            mine: false,
            createdAt: AT(50),
        },
        { id: "m3", text: "tudo ótimo!", mine: true, createdAt: AT(48) },
        { id: "m4", text: "cheguei ontem", mine: true, createdAt: AT(48) },
        { id: "m5", text: "fico até domingo", mine: true, createdAt: AT(47), status: "read" },
        // Fora da janela de agrupamento: começa um bloco novo mesmo sendo do mesmo autor.
        { id: "m6", text: "vamos hoje?", mine: false, createdAt: AT(3) },
    ],
    "messaging:mock-2": [
        {
            id: "m1",
            text: "cara, acabei de ver o moment que você postou ontem à noite e fiquei pensando naquilo o dia inteiro",
            mine: false,
            createdAt: AT(120),
        },
        { id: "m2", text: "sério? qual deles", mine: true, createdAt: AT(118), status: "sent" },
    ],
    "messaging:mock-7": [
        { id: "m1", text: "tô saindo agora", mine: false, createdAt: AT(12) },
        { id: "m2", text: "chego em 10", mine: false, createdAt: AT(11) },
    ],
}
