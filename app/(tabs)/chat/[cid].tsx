import React from "react"
import { ActivityIndicator, Pressable, Text, View } from "react-native"
import { Stack, router, useFocusEffect, useLocalSearchParams } from "expo-router"
import { useHeaderHeight } from "expo-router/react-navigation"
import { KeyboardStickyView } from "react-native-keyboard-controller"

import ChatList, { isDivider, type ChatRow } from "@/components/chat/list"
import { TypingIndicator } from "@/components/chat/typing.indicator"
import type { MessageAuthorProps, MessageReciveDataProps } from "@/components/chat/message"
import {
    ChatAvatar,
    ChatComposer,
    isMockGroupChat,
    mockMessages,
    useActiveChatChannel,
    useConversation,
    useTyping,
    withDateDividers,
} from "@/features/chat"
import PersistedContext from "@/contexts/Persisted"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { useChat } from "@/contexts/Chat"
import { useToast } from "@/contexts/Toast"

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
 * dia e aviso do sistema. A tela entrega as linhas, o avatar e o que fazer ao chegar no topo.
 *
 * **Sem tab bar.** A rota entra na regra de `hideTabBar` do layout das abas: aqui a barra de
 * baixo é o campo de escrita, não a navegação.
 *
 * Os dados vêm do `useConversation`, que lê do `channel.state` do Stream a cada evento. O
 * mock continua sob `__DEV__`, mas só quando não há conexão — com o chat de pé, o que se vê
 * é a conversa real.
 */
export default function ConversationScreen() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { status } = useChat()
    const toast = useToast()
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

    // Suprime o banner do push desta conversa enquanto ela estiver na tela (§9.2).
    useActiveChatChannel(chatId)

    /*
     * A conversa acabou: apagada pela moderação, ou o acesso revogado porque a amizade foi
     * desfeita (§12). Sair é o único desfecho — a tela não tem o que mostrar, e insistir
     * deixaria a pessoa num histórico que não existe mais.
     */
    const handleGone = React.useCallback(() => {
        toast.error(t("This conversation is no longer available."))
        router.back()
    }, [t, toast])

    const conversation = useConversation(chatId, { onGone: handleGone })

    /*
     * Quem está lendo.
     *
     * A identidade do chat vem do client conectado; a da sessão é o plano B, e o `"me"` cobre
     * o desenvolvimento com mock e sem sessão — sem ele o id fica vazio, **nenhuma** mensagem
     * é minha, e a conversa inteira desenha do lado de quem recebe.
     */
    const myUserId =
        conversation.channel?.getClient().userID || String(session.account.userId ?? "") || "me"

    const connected = status === "ready" && conversation.ready

    /**
     * O rótulo da virada de dia.
     *
     * Formatado aqui porque depende do idioma da sessão, que só a tela conhece. "Hoje" e
     * "ontem" são relativos ao aparelho de quem lê, não ao horário em que a mensagem saiu.
     */
    const labelForDay = React.useCallback(
        (iso: string) => {
            const date = new Date(iso)
            const today = new Date()
            const yesterday = new Date(today)
            yesterday.setDate(today.getDate() - 1)

            const sameDay = (a: Date, b: Date) =>
                a.getFullYear() === b.getFullYear() &&
                a.getMonth() === b.getMonth() &&
                a.getDate() === b.getDate()

            if (sameDay(date, today)) return t("Today")
            if (sameDay(date, yesterday)) return t("Yesterday")

            return date.toLocaleDateString(undefined, { day: "numeric", month: "long" })
        },
        [t],
    )

    // A costura com o Stream mora nesta linha, e só nela.
    const rows = React.useMemo<ChatRow[]>(() => {
        if (connected) return withDateDividers(conversation.messages, labelForDay)
        if (__DEV__ && status !== "ready") return mockMessages(chatId, myUserId)
        return EMPTY
    }, [connected, conversation.messages, labelForDay, status, chatId, myUserId])

    /*
     * Título vindo do outro participante, e não do `cid`.
     *
     * Sem isto o header mostra `[cid]` — o nome do arquivo de rota, que é o fallback do
     * expo-router quando a tela não declara título. Com conexão, o nome sai do próprio canal;
     * com mock, é derivado do primeiro autor que não sou eu.
     */
    const title = React.useMemo(() => {
        if (conversation.peer) {
            return conversation.peer.name ?? conversation.peer.username
        }

        // Divisores não têm autor: virada de dia e aviso do sistema entram como linhas da
        // mesma lista.
        const other = rows.find(
            (row): row is MessageReciveDataProps => !isDivider(row) && row.author.id !== myUserId,
        )
        return other?.author.name ?? other?.author.username ?? ""
    }, [conversation.peer, rows, myUserId])

    const typing = useTyping(conversation.channel, myUserId)

    /*
     * Marcar como lido no foco.
     *
     * `watch()` não faz isso sozinho sem os componentes do SDK. É esta chamada que zera o
     * badge da aba e o contador da célula — e que faz o outro lado ver o ✓✓.
     */
    const markRead = conversation.markRead
    useFocusEffect(
        React.useCallback(() => {
            markRead()
        }, [markRead]),
    )

    /*
     * Quem está digitando nesta conversa.
     *
     * Com conexão, vem do `channel.state.typing`. Sem ela, o autor sai das linhas do mock —
     * é o que mantém a bolha exercitável em desenvolvimento.
     */
    const typingAuthor = React.useMemo<MessageAuthorProps | undefined>(() => {
        if (!typing.peerTyping) return undefined

        if (conversation.peer) {
            return {
                id: conversation.peer.id,
                username: conversation.peer.username,
                name: conversation.peer.name,
                profilePicture: conversation.peer.profilePicture,
            }
        }

        const row = rows.find(
            (item): item is MessageReciveDataProps =>
                !isDivider(item) && String(item.author?.id) !== myUserId,
        )
        return row?.author
    }, [typing.peerTyping, conversation.peer, rows, myUserId])

    const isGroup = isMockGroupChat(chatId)

    /*
     * O avatar sai do autor, e não da mensagem: a bolha de digitando também precisa de um, e
     * ali não há mensagem nenhuma — só a pessoa.
     */
    const renderAvatarFor = React.useCallback(
        (author: MessageAuthorProps) => (
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

    const handleAction = React.useCallback(
        (action: string, messageId: string) => {
            // Reenvio é a única ação que esta versão executa. Editar, apagar e reagir dependem
            // de permissão configurada no app do Stream e de decisão de produto (§8.6).
            if (action !== "retry") {
                if (__DEV__) console.log("[chat] ação ainda não implementada:", action, messageId)
                return
            }

            const failed = rows.find(
                (row): row is MessageReciveDataProps => !isDivider(row) && row.id === messageId,
            )
            if (failed?.content) conversation.send(failed.content, failed.id)
        },
        [conversation, rows],
    )

    const handleSend = React.useCallback(
        (text: string) => {
            typing.onSubmitOrBlur()
            conversation.send(text)
        },
        [conversation, typing],
    )

    return (
        <View style={{ flex: 1, backgroundColor: colors.gray.black }}>
            <Stack.Screen
                options={{
                    headerTitle: title,
                    /*
                     * Atalho de comparação, só em desenvolvimento: abre a MESMA conversa
                     * desenhada pelos componentes do `stream-chat-expo`
                     * (`app/(tabs)/chat/sdk/[cid].tsx`). Sai junto com o protótipo quando a
                     * decisão for tomada.
                     */
                    headerRight: __DEV__
                        ? () => (
                              <Pressable
                                  hitSlop={8}
                                  onPress={() =>
                                      router.push(
                                          // `as any` porque as rotas tipadas do expo-router
                                          // são geradas no build, e esta é uma rota de
                                          // protótipo que não deve entrar na união oficial.
                                          `/(tabs)/chat/sdk/${encodeURIComponent(chatId)}` as any,
                                      )
                                  }
                              >
                                  <Text
                                      style={{
                                          fontFamily: fonts.family.Semibold,
                                          fontSize: fonts.size.footnote,
                                          color: colors.gray.grey_04,
                                      }}
                                  >
                                      SDK
                                  </Text>
                              </Pressable>
                          )
                        : undefined,
                }}
            />

            {status === "connecting" ? (
                <Centered>
                    <ActivityIndicator color={colors.gray.grey_04} />
                </Centered>
            ) : rows.length === 0 ? (
                <Centered>
                    <Text
                        style={{
                            fontFamily: fonts.family.Regular,
                            fontSize: fonts.size.body,
                            color: colors.gray.grey_04,
                        }}
                    >
                        {t("Say hi")}
                    </Text>
                </Centered>
            ) : (
                <ChatList
                    rows={rows}
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
                    // O passado fica no início da lista: subir é que carrega mais.
                    onStartReached={conversation.loadOlder}
                    header={
                        conversation.loadingOlder ? (
                            <View style={{ paddingVertical: sizes.paddings["1sm"] }}>
                                <ActivityIndicator color={colors.gray.grey_04} />
                            </View>
                        ) : null
                    }
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
                <ChatComposer
                    placeholder={t("Message")}
                    onSend={handleSend}
                    onTyping={typing.onChangeText}
                    onStopTyping={typing.onSubmitOrBlur}
                />
            </KeyboardStickyView>
        </View>
    )
}

function Centered({ children }: { children: React.ReactNode }) {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>{children}</View>
    )
}
