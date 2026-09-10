import type { MessageAuthorProps, MessageReciveDataProps } from "@/components/chat/message"

import type { ChatPreview } from "./chat.types"

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

/** `color` é usado pelo nome do autor em conversa de grupo — mesmo campo do mock das
 * stories (`src/components/chat/message/stories/message.mock.ts`). */
const author = (
    id: string,
    name: string,
    picture?: string,
    color?: string,
): MessageAuthorProps => ({
    id,
    username: name.toLowerCase(),
    name,
    profilePicture: picture ?? null,
    ...(color ? { color } : {}),
})

/** Molde com os campos obrigatórios preenchidos, para cada mensagem do mock declarar só o
 * que a diferencia das outras. */
const message = (
    partial: Partial<MessageReciveDataProps> & Pick<MessageReciveDataProps, "id" | "author">,
): MessageReciveDataProps => ({
    chatId: "messaging:mock",
    contentType: "text",
    content: null,
    status: "sent",
    createdAt: AT(0),
    ...partial,
})

/**
 * Mensagens por conversa, no modelo que `Message.Render` consome.
 *
 * É uma função, e não uma constante, porque `isMine` é derivado no provider comparando o
 * autor com `session.account.userId`. Sem receber o id de quem está logado, **toda** mensagem
 * do mock cairia do lado esquerdo e não daria para ver a bolha de saída.
 *
 * A primeira conversa tem blocos encadeados dos dois lados de propósito: é o que permite ver
 * o agrupamento funcionando — avatar e cantos só nas pontas do bloco. Também cobre resposta
 * citada, reação, mensagem editada, nota de voz e mensagem apagada.
 */
export function mockMessages(cid: string, myUserId: string): MessageReciveDataProps[] {
    const me = author(myUserId || "me", "Você")
    const marina = author("u-marina", "Marina", "https://i.pravatar.cc/300?img=5", "#7C3AED")
    const rafael = author("u-rafael", "Rafael", "https://i.pravatar.cc/300?img=12", "#E8590C")
    const duda = author("u-duda", "Duda", "https://i.pravatar.cc/300?img=24", "#0CA678")

    const byChat: Record<string, MessageReciveDataProps[]> = {
        "messaging:mock-1": [
            message({ id: "m1", author: marina, content: "oi! tudo bem?", createdAt: AT(50) }),
            message({
                id: "m2",
                author: marina,
                content: "vi que você tá em são paulo essa semana",
                createdAt: AT(50),
            }),
            message({ id: "m3", author: me, content: "tudo ótimo!", createdAt: AT(48) }),
            message({ id: "m4", author: me, content: "cheguei ontem", createdAt: AT(48) }),
            message({
                id: "m5",
                author: me,
                content: "fico até domingo",
                status: "read",
                createdAt: AT(47),
                editedAt: AT(46),
            }),
            // Nota de voz: o `waveform` chega pronto, como o Stream entrega.
            message({
                id: "m6",
                author: marina,
                contentType: "audio",
                content: null,
                createdAt: AT(20),
                media: {
                    url: "https://example.invalid/audio.m4a",
                    duration: 8,
                    waveform: Array.from(
                        { length: 40 },
                        (_, i) => 0.2 + 0.6 * Math.abs(Math.sin(i / 3)),
                    ),
                },
            }),
            // Fora da janela de agrupamento: bloco novo, mesmo sendo da mesma pessoa.
            message({
                id: "m7",
                author: marina,
                content: "vamos hoje?",
                createdAt: AT(3),
                reactions: [{ emoji: "❤️", count: 2, reactedByMe: true }],
            }),
        ],
        "messaging:mock-2": [
            message({
                id: "m1",
                author: rafael,
                content:
                    "cara, acabei de ver o moment que você postou ontem à noite e fiquei pensando naquilo o dia inteiro",
                createdAt: AT(120),
            }),
            // Resposta citada.
            message({
                id: "m2",
                author: me,
                content: "sério? qual deles",
                status: "sent",
                createdAt: AT(118),
                replyTo: {
                    id: "m1",
                    author: rafael,
                    preview: "cara, acabei de ver o moment que você postou ontem à noite",
                    contentType: "text",
                },
            }),
            // Apagada: vira lápide, e nenhuma ação além de ler.
            message({
                id: "m3",
                author: rafael,
                content: "deixa pra lá",
                createdAt: AT(117),
                deletedAt: AT(116),
            }),
        ],
        "messaging:mock-7": [
            message({ id: "m1", author: duda, content: "tô saindo agora", createdAt: AT(12) }),
            message({ id: "m2", author: duda, content: "chego em 10", createdAt: AT(11) }),
            // Falha de envio: status `failed` habilita o "tentar de novo" no menu.
            message({
                id: "m3",
                author: me,
                content: "beleza, te espero",
                status: "failed",
                createdAt: AT(10),
            }),
        ],
    }

    return byChat[cid] ?? []
}
