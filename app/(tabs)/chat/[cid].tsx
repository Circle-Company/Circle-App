import React from "react"
import { Text, View } from "react-native"
import { Stack, useLocalSearchParams } from "expo-router"
import { useHeaderHeight } from "expo-router/react-navigation"
import { KeyboardStickyView } from "react-native-keyboard-controller"

import ChatList from "@/components/chat/list"
import type { MessageReciveDataProps } from "@/components/chat/message"
import { ChatAvatar, ChatComposer, mockMessages } from "@/features/chat"
import PersistedContext from "@/contexts/Persisted"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"

/** Referência estável para as conversas sem mensagem — um literal novo a cada render
 * faria o `useMemo` abaixo não memoizar nada. */
const EMPTY: MessageReciveDataProps[] = []

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
    // O header desta rota é transparente: sem reservar a altura dele, a primeira mensagem
    // nasce por trás.
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

    const myUserId = String(session.account.userId ?? "")

    // A costura com o Stream mora nesta linha, e só nela. O mock precisa do id de quem está
    // logado porque `isMine` é derivado no provider comparando o autor com a sessão.
    const messages = React.useMemo(
        () => (__DEV__ ? mockMessages(chatId, myUserId) : EMPTY),
        [chatId, myUserId],
    )

    /*
     * Os dois avisos abaixo cobrem as falhas silenciosas desta tela, que se parecem com bug
     * de layout mas não são:
     *
     * - lista vazia: o `chatId` não bate com nenhuma chave do mock;
     * - tudo do lado esquerdo: sem `userId` na sessão o provider nunca marca `isMine`, e
     *   não dá para forçar por prop (`MessageOptionsInput` não expõe `isMine`).
     */
    React.useEffect(() => {
        if (__DEV__ && messages.length === 0) {
            console.warn("[chat] nenhum mock para o chatId:", JSON.stringify(chatId))
        }
    }, [chatId, messages.length])

    React.useEffect(() => {
        if (__DEV__ && !myUserId) {
            console.warn(
                "[chat] sem userId na sessão: todas as mensagens vão renderizar como recebidas",
            )
        }
    }, [myUserId])

    /*
     * Título vindo do outro participante, e não do `cid`.
     *
     * Sem isto o header mostra `[cid]` — o nome do arquivo de rota, que é o fallback do
     * expo-router quando a tela não declara título. Derivar do primeiro autor que não sou eu
     * funciona igual com o mock e com o Stream, e é o nome certo numa DM.
     */
    const title = React.useMemo(() => {
        const other = messages.find((message) => message.author.id !== myUserId)
        return other?.author.name ?? other?.author.username ?? ""
    }, [messages, myUserId])

    const renderAvatar = React.useCallback(
        (message: MessageReciveDataProps) => (
            <ChatAvatar
                size={AVATAR_SIZE}
                profilePicture={message.author.profilePicture ?? undefined}
                name={message.author.name ?? message.author.username}
            />
        ),
        [],
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
                    contentInsetTop={headerHeight}
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
