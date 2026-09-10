import type { ChatRow } from "@/components/chat/list/chat.list.types"
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
    username: name.toLowerCase().split(" ")[0],
    name,
    profilePicture: picture ?? null,
    ...(color ? { color } : {}),
})

const marina = author("u-marina", "Marina", "https://i.pravatar.cc/300?img=5", "#7C3AED")
const rafael = author("u-rafael", "Rafael", "https://i.pravatar.cc/300?img=12", "#E8590C")
const duda = author("u-duda", "Duda", "https://i.pravatar.cc/300?img=24", "#0CA678")
const bia = author("u-bia", "Bia", "https://i.pravatar.cc/300?img=9", "#1098AD")
const tom = author("u-tom", "Tom", "https://i.pravatar.cc/300?img=60", "#F76707")

/** Molde com os campos obrigatórios preenchidos, para cada mensagem declarar só o que a
 * diferencia das outras. */
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

const dateDivider = (id: string, label: string): ChatRow => ({ kind: "date", id, label })
const systemRow = (id: string, text: string): ChatRow => ({ kind: "system", id, text })

/**
 * Waveform de exemplo: valores plausíveis de fala, com silêncios nas pontas. O Stream
 * entrega isto pronto em `attachment.waveform_data`, então o componente não precisa baixar
 * e decodificar o arquivo para desenhar o traço.
 */
const waveform = Array.from({ length: 28 }, (_, i) =>
    Math.max(0.08, Math.abs(Math.sin(i / 2.4)) * (i < 3 || i > 24 ? 0.25 : 1)),
)

/** Conversas de grupo do mock: a tela usa para ligar `isGroup`, que habilita nome do autor
 * e o vão do avatar. */
const GROUP_CHATS = new Set(["messaging:mock-3"])

export const isMockGroupChat = (cid: string): boolean => GROUP_CHATS.has(cid)

/**
 * Mensagens por conversa, no modelo que a lista consome (`ChatRow`, que aceita mensagem,
 * virada de dia e aviso do sistema).
 *
 * É uma função, e não uma constante, porque `isMine` é derivado no provider comparando o
 * autor com `session.account.userId`. Sem receber o id de quem está logado, **toda**
 * mensagem do mock cairia do lado esquerdo.
 *
 * Cada conversa concentra um conjunto de casos, para dar para abrir uma e conferir um tema
 * inteiro em vez de caçar exemplos espalhados:
 *
 *   - `mock-1` — o fluxo completo de uma DM: divisores, blocos encadeados, resposta,
 *     menção, reações, editada, encaminhada, fixada, contagem de respostas, nota de voz,
 *     apagada e os cinco estados de entrega;
 *   - `mock-2` — mídia e texto difícil: imagem, vídeo, documento, resposta a áudio, URL sem
 *     espaço, texto muito longo, só emoji;
 *   - `mock-3` — grupo: três autores, nome no topo da bolha e avatar na última do bloco;
 *   - `mock-7` — falha e reenvio.
 */
export function mockMessages(cid: string, myUserId: string): ChatRow[] {
    const me = author(myUserId || "me", "Você")

    const byChat: Record<string, ChatRow[]> = {
        // ── DM completa: a conversa de referência ────────────────────────────────────
        //
        // Serve para conferir tudo de uma vez, e por isso é longa de propósito. A ordem não
        // é cronológica por acaso: cada trecho encosta um caso no outro para expor as
        // combinações que só aparecem na vizinhança — bloco encadeado, áudio seguido de
        // texto, apagada no meio do bloco, reação sob a última do bloco.
        "messaging:mock-1": [
            dateDivider("d-anteontem", "ANTEONTEM"),
            systemRow("s-amigos", "Vocês agora são amigos"),

            // 1. Bloco de três recebidas: abre, meio e fecha.
            message({ id: "m01", author: marina, content: "oi! tudo bem?", createdAt: AT(3000) }),
            message({
                id: "m02",
                author: marina,
                content: "vi que você tá em são paulo essa semana",
                createdAt: AT(2999),
            }),
            message({
                id: "m03",
                author: marina,
                content: "queria muito te ver antes de você voltar",
                createdAt: AT(2998),
            }),

            // 2. Recebida isolada, com reação de outra pessoa.
            message({
                id: "m04",
                author: marina,
                content: "sério, faz meses",
                createdAt: AT(2900),
                reactions: [{ emoji: "🥺", count: 1, reactedByMe: false }],
            }),

            // 3. Bloco de três enviadas, fechando com "entregue".
            message({
                id: "m05",
                author: me,
                content: "tudo ótimo!",
                status: "sent",
                createdAt: AT(2890),
            }),
            message({
                id: "m06",
                author: me,
                content: "cheguei ontem",
                status: "sent",
                createdAt: AT(2889),
            }),
            message({
                id: "m07",
                author: me,
                content: "fico até domingo",
                status: "delivered",
                createdAt: AT(2888),
            }),

            // 4. Enviada isolada, editada e lida.
            message({
                id: "m08",
                author: me,
                content: "na verdade até segunda de manhã",
                status: "read",
                createdAt: AT(2800),
                editedAt: AT(2799),
            }),

            dateDivider("d-ontem", "ONTEM"),

            // 5. Recebida citando uma enviada editada.
            message({
                id: "m09",
                author: marina,
                content: "então dá tempo!",
                createdAt: AT(1500),
                replyTo: {
                    id: "m08",
                    author: me,
                    preview: "na verdade até segunda de manhã",
                    contentType: "text",
                    edited: true,
                },
            }),

            // 6. Enviada citando uma recebida.
            message({
                id: "m10",
                author: me,
                content: "dá sim, o que você propõe?",
                status: "read",
                createdAt: AT(1499),
                replyTo: {
                    id: "m09",
                    author: marina,
                    preview: "então dá tempo!",
                    contentType: "text",
                },
            }),

            // 7. Menção no meio do texto.
            message({
                id: "m11",
                author: marina,
                content: "chamei a @Bia também, tudo bem?",
                createdAt: AT(1400),
                mentions: [{ start: 12, end: 16, userId: bia.id, username: bia.username }],
            }),

            // 8. Menção no começo e no fim, duas pessoas.
            message({
                id: "m12",
                author: marina,
                content: "@Você e @Tom vocês se conhecem?",
                createdAt: AT(1399),
                mentions: [
                    { start: 0, end: 5, userId: "me", username: "voce" },
                    { start: 8, end: 12, userId: tom.id, username: tom.username },
                ],
            }),

            // 9. Encaminhada, recebida.
            message({
                id: "m13",
                author: marina,
                content: "o endereço é rua augusta 1500, às 20h",
                createdAt: AT(1300),
                forwarded: true,
            }),

            // 10. Encaminhada e fixada ao mesmo tempo, enviada.
            message({
                id: "m14",
                author: me,
                content: "salvei aqui pra não perder",
                status: "read",
                createdAt: AT(1299),
                forwarded: true,
                pinned: true,
            }),

            dateDivider("d-hoje", "HOJE"),

            // 11. Uma reação só, na recebida.
            message({
                id: "m15",
                author: marina,
                content: "bom dia! ainda de pé?",
                createdAt: AT(600),
                reactions: [{ emoji: "👍", count: 1, reactedByMe: true }],
            }),

            // 12. Muitas reações, na enviada — testa a quebra da linha de pílulas.
            message({
                id: "m16",
                author: me,
                content: "de pé!",
                status: "read",
                createdAt: AT(599),
                reactions: [
                    { emoji: "❤️", count: 3, reactedByMe: true },
                    { emoji: "🔥", count: 12, reactedByMe: false },
                    { emoji: "😂", count: 1, reactedByMe: false },
                    { emoji: "🎉", count: 7, reactedByMe: false },
                    { emoji: "👏", count: 2, reactedByMe: true },
                ],
            }),

            // 13. Contagem de respostas: o rodapé aparece fora do fim do bloco.
            message({
                id: "m17",
                author: marina,
                content: "alguém sabe se tem estacionamento por lá?",
                createdAt: AT(500),
                replyCount: 4,
            }),
            message({
                id: "m18",
                author: marina,
                content: "(continuo no bloco, com o rodapé da anterior acima)",
                createdAt: AT(499),
            }),

            // 14. Nota de voz recebida, seguida de texto do mesmo autor — o caso que pede
            //     respiro extra, porque a linha do áudio desenha o avatar.
            message({
                id: "m19",
                author: marina,
                contentType: "audio",
                content: null,
                createdAt: AT(400),
                media: { url: "https://example.invalid/marina-1.m4a", duration: 12, waveform },
            }),
            message({
                id: "m20",
                author: marina,
                content: "resumindo: leva casaco",
                createdAt: AT(399),
            }),

            // 15. Duas notas de voz seguidas, mesma pessoa.
            message({
                id: "m21",
                author: marina,
                contentType: "audio",
                content: null,
                createdAt: AT(380),
                media: { url: "https://example.invalid/marina-2.m4a", duration: 4, waveform },
            }),
            message({
                id: "m22",
                author: marina,
                contentType: "audio",
                content: null,
                createdAt: AT(379),
                media: { url: "https://example.invalid/marina-3.m4a", duration: 47, waveform },
            }),

            // 16. Nota de voz enviada, com reação e status lido.
            message({
                id: "m23",
                author: me,
                contentType: "audio",
                content: null,
                status: "read",
                createdAt: AT(370),
                media: { url: "https://example.invalid/eu-1.m4a", duration: 21, waveform },
                reactions: [{ emoji: "😂", count: 1, reactedByMe: false }],
            }),

            // 17. Nota de voz sem waveform: cai no traço reto de placeholder.
            message({
                id: "m24",
                author: marina,
                contentType: "audio",
                content: null,
                createdAt: AT(360),
                media: { url: "https://example.invalid/sem-waveform.m4a", duration: 9 },
            }),

            // 18. Citação de uma nota de voz: a prévia não tem texto.
            message({
                id: "m25",
                author: me,
                content: "ouvi agora, faz sentido",
                status: "read",
                createdAt: AT(350),
                replyTo: { id: "m24", author: marina, preview: "", contentType: "audio" },
            }),

            // 19. Apagada recebida, no meio de um bloco.
            message({
                id: "m26",
                author: marina,
                content: "ah, e outra coisa",
                createdAt: AT(300),
            }),
            message({
                id: "m27",
                author: marina,
                content: "esquece o que eu disse",
                createdAt: AT(299),
                deletedAt: AT(298),
            }),
            message({
                id: "m28",
                author: marina,
                content: "melhor falar pessoalmente",
                createdAt: AT(298),
            }),

            // 20. Apagada enviada, isolada.
            message({
                id: "m29",
                author: me,
                content: "mensagem que eu apaguei",
                status: "read",
                createdAt: AT(250),
                deletedAt: AT(249),
            }),

            // 21. Texto de uma palavra só e emoji sozinho, dos dois lados.
            message({ id: "m30", author: marina, content: "kkkkkk", createdAt: AT(200) }),
            message({ id: "m31", author: me, content: "😂", status: "read", createdAt: AT(199) }),
            message({ id: "m32", author: marina, content: "🎉🎉🎉", createdAt: AT(198) }),

            // 22. Texto longo dos dois lados, para o teto de largura e a altura da bolha.
            message({
                id: "m33",
                author: marina,
                content:
                    "lembra daquele lugar que a gente foi no ano passado, aquele bar com a escada estreita e o terraço no fundo? descobri que reabriu com outro nome e a mesma cozinha. tô achando que é ali que a gente devia ir, mas se você preferir algo mais tranquilo eu procuro outra coisa.",
                createdAt: AT(150),
            }),
            message({
                id: "m34",
                author: me,
                content:
                    "lembro perfeitamente, inclusive foi a noite em que choveu e a gente ficou preso lá até a uma da manhã esperando passar. se reabriu com a mesma cozinha eu topo na hora, só precisamos chegar cedo porque aquele terraço lota rápido quando o tempo está bom.",
                status: "read",
                createdAt: AT(149),
            }),

            // 23. Mensagem que é SÓ um link: endereço em destaque e a dica de abrir embaixo.
            //     A URL é longa de propósito, sem espaço para quebrar.
            message({
                id: "m35",
                author: marina,
                content:
                    "https://exemplo.com.br/um/caminho/absurdamente/longo/sem/nenhum/espaco/para/quebrar",
                createdAt: AT(100),
            }),
            // 23b. O contraste: link no meio da frase continua texto comum, sem a dica.
            message({
                id: "m35b",
                author: me,
                content: "achei aqui https://exemplo.com.br/curto vale a pena",
                status: "read",
                createdAt: AT(99),
            }),

            systemRow("s-chamada", "Chamada de voz encerrada · 4 min"),

            // 24. Mídia recebida: imagem com legenda, vídeo sem legenda, documento.
            message({
                id: "m36",
                author: marina,
                contentType: "image",
                content: "olha o terraço",
                createdAt: AT(80),
                media: {
                    url: "https://picsum.photos/seed/circle-terraco/900/1200",
                    width: 900,
                    height: 1200,
                },
            }),
            message({
                id: "m37",
                author: marina,
                contentType: "video",
                content: null,
                createdAt: AT(79),
                media: {
                    url: "https://example.invalid/terraco.mp4",
                    duration: 34,
                    thumbnailUrl: "https://picsum.photos/seed/circle-video/600/800",
                },
            }),
            message({
                id: "m38",
                author: marina,
                contentType: "document",
                content: null,
                createdAt: AT(78),
                media: {
                    url: "https://example.invalid/cardapio.pdf",
                    fileName: "cardapio-degustacao-2026.pdf",
                    fileSize: 348_112,
                    mimeType: "application/pdf",
                    pageCount: 12,
                },
            }),

            // 25. Mídia enviada, para o mesmo layout do outro lado.
            message({
                id: "m39",
                author: me,
                contentType: "image",
                content: null,
                status: "delivered",
                createdAt: AT(60),
                media: {
                    url: "https://picsum.photos/seed/circle-eu/800/800",
                    width: 800,
                    height: 800,
                },
            }),

            // 26. Os estados de envio que faltavam, no fim da conversa.
            message({
                id: "m40",
                author: me,
                content: "combinado então",
                status: "pending",
                createdAt: AT(3),
            }),
            message({
                id: "m41",
                author: me,
                content: "te mando o endereço do bar depois",
                status: "failed",
                createdAt: AT(2),
            }),

            // 27. Última recebida da conversa: fecha com uma reação minha.
            message({
                id: "m42",
                author: marina,
                content: "combinadíssimo 🎈",
                createdAt: AT(1),
                reactions: [{ emoji: "❤️", count: 1, reactedByMe: true }],
            }),
        ],

        // ── Mídia e texto difícil ────────────────────────────────────────────────────
        "messaging:mock-2": [
            dateDivider("d-1", "HOJE"),

            message({
                id: "m1",
                author: rafael,
                contentType: "image",
                content: "olha o pôr do sol de ontem",
                createdAt: AT(300),
                media: {
                    url: "https://picsum.photos/seed/circle-chat/900/1200",
                    width: 900,
                    height: 1200,
                },
            }),
            message({
                id: "m2",
                author: rafael,
                contentType: "video",
                content: null,
                createdAt: AT(299),
                media: {
                    url: "https://example.invalid/clip.mp4",
                    duration: 34,
                    thumbnailUrl: "https://picsum.photos/seed/circle-clip/600/800",
                },
            }),
            message({
                id: "m3",
                author: rafael,
                contentType: "document",
                content: null,
                createdAt: AT(298),
                media: {
                    url: "https://example.invalid/contrato.pdf",
                    fileName: "contrato-assinado-versao-final.pdf",
                    fileSize: 348_112,
                    mimeType: "application/pdf",
                    pageCount: 12,
                },
            }),

            // Resposta citando um áudio: a citação não tem texto para mostrar.
            message({
                id: "m4",
                author: me,
                content: "ouvi agora, faz sentido",
                status: "read",
                createdAt: AT(200),
                replyTo: {
                    id: "x-audio",
                    author: rafael,
                    preview: "",
                    contentType: "audio",
                },
            }),

            // URL longa sem espaço: não pode empurrar a bolha para fora da tela.
            message({
                id: "m5",
                author: rafael,
                content:
                    "https://exemplo.com.br/um/caminho/absurdamente/longo/sem/nenhum/espaco/para/quebrar",
                createdAt: AT(150),
            }),

            // Texto longo de verdade, para conferir a altura da bolha e o teto de largura.
            message({
                id: "m6",
                author: rafael,
                content:
                    "cara, acabei de ver o moment que você postou ontem à noite e fiquei pensando naquilo o dia inteiro. o jeito que a luz batia na fachada do prédio, o take passando devagar, tudo funcionou. quero muito entender como você fez esse enquadramento porque eu tentei algo parecido semana passada e não chegou nem perto.",
                createdAt: AT(100),
            }),

            // Só emoji: fonte grande em muitos apps, aqui é o caso de conteúdo mínimo.
            message({ id: "m7", author: me, content: "😂😂😂", status: "sent", createdAt: AT(90) }),
        ],

        // ── Grupo ────────────────────────────────────────────────────────────────────
        "messaging:mock-3": [
            systemRow("s-1", "Marina adicionou Bia ao grupo"),

            message({
                id: "m1",
                author: marina,
                content: "gente, sexta tá de pé?",
                createdAt: AT(400),
            }),
            message({ id: "m2", author: bia, content: "por mim sim!", createdAt: AT(399) }),
            message({
                id: "m3",
                author: bia,
                content: "só não posso chegar antes das 21h",
                createdAt: AT(398),
            }),
            message({
                id: "m4",
                author: tom,
                content: "eu levo a caixa de som",
                createdAt: AT(390),
                reactions: [{ emoji: "🎉", count: 2, reactedByMe: true }],
            }),
            message({
                id: "m5",
                author: me,
                content: "fechado, marco a mesa pra 21h30",
                status: "read",
                createdAt: AT(380),
            }),
        ],

        // ── Falha e reenvio ──────────────────────────────────────────────────────────
        "messaging:mock-7": [
            message({ id: "m1", author: duda, content: "tô saindo agora", createdAt: AT(12) }),
            message({ id: "m2", author: duda, content: "chego em 10", createdAt: AT(11) }),
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
