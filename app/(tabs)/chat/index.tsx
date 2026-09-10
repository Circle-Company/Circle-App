import React from "react"
import { Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { router } from "expo-router"

import {
    CHAT_GRID_COLUMNS,
    CHAT_GRID_PADDING,
    ChatConversationCell,
    MOCK_CONVERSATIONS,
    type ChatPreview,
} from "@/features/chat"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"

/**
 * O grid de conversas.
 *
 * **A fonte de dados ainda não está ligada.** O `stream-chat-expo` não está instalado e o
 * endpoint `/chat/token` não existe — ver `docs/chat-stream-implementation.md`, fases 0 e 1.
 * Enquanto isso a tela renderiza o estado vazio, que é um estado real do produto e precisa
 * existir de qualquer forma.
 *
 * Quando o SDK entrar, o que muda aqui é só a origem de `previews`:
 *
 *     const { channels, loadNextPage, hasNextPage, refreshing, refreshList } =
 *         useChannelsContext()
 *     const previews = channels.map(toChatPreview)   // adaptador a escrever
 *
 * e a lista ganha `onEndReached`, `refreshing` e `onRefresh` a partir desses valores. O
 * `ChannelsContext` já entrega paginação, refresh e erro prontos — por isso a lista é nossa
 * e o `ChannelList` do SDK não é usado: não há forma documentada de substituir a célula dele
 * por uma célula de grid (§8.1 do documento).
 */
export default function ChatScreen() {
    const { t } = React.useContext(LanguageContext)

    /*
     * A costura com o Stream mora nesta linha, e só nela.
     *
     * Hoje: mock em desenvolvimento, vazio em produção — o `__DEV__` garante que nenhum
     * usuário falso chega a um build publicado. Depois, vira:
     *
     *     const { channels } = useChannelsContext()
     *     const previews = channels.map(toChatPreview)
     */
    const previews: ChatPreview[] = __DEV__ ? MOCK_CONVERSATIONS : []

    const openConversation = React.useCallback((cid: string) => {
        router.push(`/(tabs)/chat/${encodeURIComponent(cid)}`)
    }, [])

    if (previews.length === 0) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: sizes.paddings["1md"],
                    backgroundColor: colors.gray.black,
                }}
            >
                <Text
                    style={{
                        fontFamily: fonts.family.Semibold,
                        fontSize: fonts.size.headline,
                        color: colors.gray.white,
                        textAlign: "center",
                    }}
                >
                    {t("No conversations yet")}
                </Text>
                <Text
                    style={{
                        marginTop: 6,
                        fontFamily: fonts.family.Regular,
                        fontSize: fonts.size.body,
                        color: colors.gray.grey_04,
                        textAlign: "center",
                    }}
                >
                    {t("Your conversations will appear here.")}
                </Text>
            </View>
        )
    }

    return (
        <FlashList
            data={previews}
            numColumns={CHAT_GRID_COLUMNS}
            keyExtractor={(preview) => preview.cid}
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: colors.gray.black }}
            contentContainerStyle={{
                paddingHorizontal: CHAT_GRID_PADDING,
                paddingBottom: sizes.paddings["1xl"],
            }}
            renderItem={({ item }) => (
                <ChatConversationCell preview={item} onPress={openConversation} />
            )}
        />
    )
}
