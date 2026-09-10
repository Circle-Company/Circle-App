import React from "react"
import { Text, View } from "react-native"
import { Stack, useLocalSearchParams } from "expo-router"
import { useHeaderHeight } from "expo-router/react-navigation"
import { KeyboardStickyView } from "react-native-keyboard-controller"

import ChatList, { isDivider, type ChatRow } from "@/components/chat/list"
import { TypingIndicator } from "@/components/chat/typing.indicator"
import type { MessageReciveDataProps } from "@/components/chat/message"
import { ChatAvatar, ChatComposer, isMockGroupChat, mockMessages } from "@/features/chat"
import PersistedContext from "@/contexts/Persisted"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { useChat } from "@/contexts/Chat"

/** Referência estável para as conversas sem mensagem — um literal novo a cada render
 * faria o `useMemo` abaixo não memoizar nada. */
const EMPTY: ChatRow[] = []

/** Casa com `messageSizes.standart.avatarSize`, que é o vão que o `Message.Container`
 * reserva para o avatar. Um valor diferente deixaria a bolha desalinhada da coluna. */
const AVATAR_SIZE = 34

/**
 * A tela de conversa.
 *
 * A lista é o `ChatList` de `src/components/chat/list/`. Ele resolve sozinho o que a tela
 * não deveria saber: a posição de cada mensagem na sequência do mesmo autor
 * (`resolveSequence`), o gesto de arrastar para revelar o horário, e as linhas de virada de
 * dia e aviso do sistema. A tela só entrega as linhas e o avatar.
 *
 * **Sem tab bar.** A rota entra na regra de `hideTabBar` do layout das abas: aqui a barra de
 * baixo é o campo de escrita, não a navegação.
 *
 * **A ligação com o Stream é o `toMessageData`** (`chat.message.adapter.ts`), que traduz
 * `LocalMessage` para o modelo do componente. Enquanto o endpoint `/chat/token` não existe
 * (ver `docs/chat-stream-implementation.md` §4) não há conexão, e as linhas vêm do mock sob
 * `__DEV__`. Trocar a origem é substituir uma linha:
 *
 *     const messages = toMessageList(channel.state.messages, { readByOthers })
 */
export default function ConversationScreen() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { cid } = useLocalSearchParams<{ cid: string }>()
    const headerHeight = useHeaderHeight()

    /*
     * O `cid` do Stream tem `:` (`messaging:abc`), e a navegação o percent-encoda. Se ele
     * voltar codificado daqui, qualquer busca por chave falha em silêncio. Decodificar é
     * idempotente sobre uma string já limpa, então serve para as duas formas.
     */
    const chatId = React.useMemo(() => {
        const raw = cid ?? ""
        try {
            return decodeURIComponent(raw)
        } catch {
            return raw
        }
    }, [cid])

    /*
     * Quem está lendo.
     *
     * O `"me"` não é enfeite: sem sessão carregada — que é o normal no simulador com o mock —
     * o id fica vazio, e aí **nenhuma** mensagem seria minha; a conversa inteira desenhava do
     * lado de quem recebe. O mesmo valor vai para o mock (que carimba o autor) e para a lista
     * (que decide o lado), então os dois concordam com ou sem sessão.
     */
    const myUserId = String(session.account.userId ?? "") || "me"

    // A costura com o Stream mora nesta linha, e só nela. O mock recebe o id de quem lê para
    // carimbar o autor das mensagens minhas com ele.
    const messages = React.useMemo(
        () => (__DEV__ ? mockMessages(chatId, myUserId) : EMPTY),
        [chatId, myUserId],
    )

    /*
     * Cobre a falha silenciosa desta tela que se parece com bug de layout mas não é: lista
     * vazia porque o `chatId` não bate com nenhuma chave do mock.
     */
    React.useEffect(() => {
        if (__DEV__ && messages.length === 0) {
            console.warn("[chat] nenhum mock para o chatId:", JSON.stringify(chatId))
        }
    }, [chatId, messages.length])

    /*
     * Título vindo do outro participante, e não do `cid`.
     *
     * Sem isto o header mostra `[cid]` — o nome do arquivo de rota, que é o fallback do
     * expo-router quando a tela não declara título. Derivar do primeiro autor que não sou eu
     * funciona igual com o mock e com o Stream, e é o nome certo numa DM.
     */
    const title = React.useMemo(() => {
        // Divisores não têm autor: virada de dia e aviso do sistema entram como linhas da
        // mesma lista.
        const other = messages.find(
            (row): row is MessageReciveDataProps => !isDivider(row) && row.author.id !== myUserId,
        )
        return other?.author.name ?? other?.author.username ?? ""
    }, [messages, myUserId])

    /*
     * Quem está digitando nesta conversa.
     *
     * Vem do contexto global do chat, que é quem recebe os avisos e os expira sozinho depois
     * do TTL — a tela não guarda nem cronometra nada. Enquanto o SDK não liga os eventos
     * `typing.start`/`typing.stop`, ninguém escreve nesse estado e a bolha simplesmente não
     * aparece.
     *
     * Em grupo mostra-se só o primeiro: uma bolha por pessoa empurraria a conversa inteira
     * para cima. O nome resolve quem é.
     */
    const { activityIn } = useChat()
    const typing = activityIn(chatId).filter((entry) => entry.activity === "typing")

    const typingAuthor = React.useMemo(() => {
        const userId = typing[0]?.userId
        if (!userId) return undefined
        const row = messages.find(
            (item): item is MessageReciveDataProps =>
                !isDivider(item) && String(item.author?.id) === String(userId),
        )
        return row?.author
    }, [messages, typing])

    const isGroup = isMockGroupChat(chatId)

    /*
     * O avatar sai do autor, e não da mensagem: a bolha de digitando também precisa de um, e
     * ali não há mensagem nenhuma — só a pessoa.
     */
    const renderAvatarFor = React.useCallback(
        (author: MessageReciveDataProps["author"]) => (
            <ChatAvatar
                size={AVATAR_SIZE}
                profilePicture={author.profilePicture ?? undefined}
                name={author.name ?? author.username}
            />
        ),
        [],
    )

    const renderAvatar = React.useCallback(
        (message: MessageReciveDataProps) => renderAvatarFor(message.author),
        [renderAvatarFor],
    )

    const handleAction = React.useCallback((action: string, messageId: string) => {
        // Sem SDK não há o que executar. Fica explícito em vez de silencioso: um menu que
        // parece funcionar e não faz nada é pior que um que declara o que falta.
        console.log("[chat] ação pendente do SDK:", action, messageId)
    }, [])

    const handleSend = React.useCallback((text: string) => {
        console.log("[chat] envio pendente do SDK:", text)
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: colors.gray.black }}>
            <Stack.Screen options={{ headerTitle: title }} />

            {messages.length === 0 ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text
                        style={{
                            fontFamily: fonts.family.Regular,
                            fontSize: fonts.size.body,
                            color: colors.gray.grey_04,
                        }}
                    >
                        {t("Say hi")}
                    </Text>
                </View>
            ) : (
                <ChatList
                    rows={messages}
                    myUserId={myUserId}
                    isGroup={isGroup}
                    /*
                     * Quem reserva o header é a lista, com padding no conteúdo — e o iOS fica
                     * fora disso (`never`).
                     *
                     * Com `automatic`, o iOS ajusta o inset depois do layout enquanto a
                     * ancoragem da lista corrige o offset conforme as alturas reais aparecem:
                     * duas correções perseguindo o mesmo valor, que é a conversa tentando se
                     * alinhar ao header durante a rolagem.
                     *
                     * O mesmo valor desce a etiqueta de data fixada, que a FlashList prende em
                     * `top: 0` do ScrollView, sem offset próprio — sob header transparente,
                     * atrás dele.
                     */
                    contentInsetAdjustmentBehavior="never"
                    contentInsetTop={headerHeight}
                    /*
                     * A bolha de digitando fecha a conversa: ela ocupa o lugar da mensagem
                     * que está para chegar, e o texto a substitui sem nada saltar.
                     */
                    footer={
                        typingAuthor ? (
                            <TypingIndicator
                                avatar={renderAvatarFor(typingAuthor)}
                                // Em conversa de dois já se sabe quem é; o nome só acrescenta
                                // em grupo.
                                authorName={
                                    isGroup
                                        ? (typingAuthor.name ?? typingAuthor.username)
                                        : undefined
                                }
                            />
                        ) : null
                    }
                    renderAvatar={renderAvatar}
                    onAction={handleAction}
                />
            )}

            <KeyboardStickyView>
                <ChatComposer placeholder={t("Message")} onSend={handleSend} />
            </KeyboardStickyView>
        </View>
    )
}
