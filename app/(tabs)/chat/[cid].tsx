import React from "react"
import { FlatList, Text, View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { KeyboardStickyView } from "react-native-keyboard-controller"

import {
    ChatComposer,
    ChatMessageBubble,
    MOCK_MESSAGES,
    groupMessages,
    type ChatBubbleMessage,
} from "@/features/chat"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"

/** Referência estável para as conversas sem mensagem — um literal novo a cada render
 * faria o `useMemo` abaixo não memoizar nada. */
const EMPTY: ChatBubbleMessage[] = []

/**
 * A tela de conversa.
 *
 * **Sem tab bar.** A rota entra na regra de `hideTabBar` do layout das abas: aqui a barra de
 * baixo é o campo de escrita, não a navegação — é como todo app de mensagem se comporta.
 *
 * O campo fica colado no teclado via `KeyboardStickyView` do `react-native-keyboard-controller`
 * (já instalado, com o `KeyboardProvider` montado na raiz em `app/_layout.tsx`). A mesma
 * biblioteca traz um `KeyboardChatScrollView`, feito exatamente para tela de conversa — vale
 * trocar se a lista precisar acompanhar o teclado com mais fidelidade que o simples deslocar
 * da barra.
 *
 * **Ainda sem SDK.** Quando o `stream-chat-expo` entrar, o corpo vira:
 *
 *     <Channel channel={channel} keyboardVerticalOffset={headerHeight} topInset={headerHeight}>
 *         <MessageList onThreadSelect={...} />
 *         <MessageComposer />
 *     </Channel>
 *
 * O `ChatMessageBubble` daqui vira o componente de mensagem customizado do `MessageList`, e o
 * `ChatComposer` substitui o `MessageComposer` padrão. Nessa hora o `Channel` passa a cuidar
 * do teclado pelos próprios insets, e o `KeyboardStickyView` daqui sai.
 */
export default function ConversationScreen() {
    const { t } = React.useContext(LanguageContext)
    const { cid } = useLocalSearchParams<{ cid: string }>()

    // Mesma costura da tela de grid: mock só em desenvolvimento, e é esta linha que passa a
    // vir do `Channel` do Stream. A referência vazia é constante para o `useMemo` valer.
    const messages: ChatBubbleMessage[] = (__DEV__ && MOCK_MESSAGES[cid]) || EMPTY
    const grouped = React.useMemo(() => groupMessages(messages), [messages])

    const handleSend = React.useCallback((text: string) => {
        // Sem SDK não há para onde mandar. Fica explícito em vez de silencioso: uma barra que
        // parece funcionar e engole a mensagem é pior que uma que declara o que falta.
        console.log("[chat] envio pendente do SDK:", text)
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: colors.gray.black }}>
            <FlatList
                data={grouped}
                keyExtractor={(message) => message.id}
                contentInsetAdjustmentBehavior="automatic"
                keyboardDismissMode="interactive"
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "flex-end",
                    paddingVertical: sizes.paddings["1md"],
                }}
                renderItem={({ item }) => <ChatMessageBubble message={item} />}
                ListEmptyComponent={
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
                }
            />

            <KeyboardStickyView>
                <ChatComposer placeholder={t("Message")} onSend={handleSend} />
            </KeyboardStickyView>
        </View>
    )
}
