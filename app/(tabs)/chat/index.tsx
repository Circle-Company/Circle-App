import React from "react"
import { ActivityIndicator, Pressable, Text, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { router } from "expo-router"

import {
    CHAT_GRID_COLUMNS,
    CHAT_GRID_PADDING,
    ChatConversationCell,
    MOCK_CONVERSATIONS,
    useChannelList,
    usePeerProfileSync,
    type ChatPreview,
} from "@/features/chat"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { useChat } from "@/contexts/Chat"

/**
 * O grid de conversas.
 *
 * A fonte de dados é o `useChannelList`, que lê do Stream — **não há endpoint nosso para a
 * lista de conversas**, e o que aparece aqui são as conversas já abertas ao menos uma vez.
 *
 * O mock continua existindo sob `__DEV__`, mas só como último recurso: ele entra quando não
 * há conexão com o chat (sem backend configurado, que é o caso de boa parte do
 * desenvolvimento). Com o chat de pé, o que se vê é o real, inclusive o estado vazio.
 */
export default function ChatScreen() {
    const { t } = React.useContext(LanguageContext)
    const { status, retryConnection } = useChat()
    const { items, loading, loadMore, refresh } = useChannelList()

    usePeerProfileSync(items)

    /*
     * A costura com o Stream mora nesta linha, e só nela.
     *
     * Sem conexão, o mock em desenvolvimento; em produção, nada. O `__DEV__` garante que
     * nenhuma conversa falsa chega a um build publicado.
     */
    const previews: ChatPreview[] = status === "ready" ? items : __DEV__ ? MOCK_CONVERSATIONS : []

    const openConversation = React.useCallback((cid: string) => {
        router.push(`/(tabs)/chat/${encodeURIComponent(cid)}`)
    }, [])

    // Conectando: esqueleto em vez de "nenhuma conversa". Anunciar vazio para quem tem
    // conversas, e corrigir um segundo depois, é pior que não anunciar nada.
    if (status === "connecting" || (status === "ready" && loading)) {
        return (
            <Centered>
                <ActivityIndicator color={colors.gray.grey_04} />
            </Centered>
        )
    }

    if (status === "error") {
        return (
            <Centered>
                <Title>{t("Could not connect")}</Title>
                <Subtitle>{t("Check your connection and try again.")}</Subtitle>
                <Pressable
                    onPress={retryConnection}
                    style={{
                        marginTop: sizes.margins["2sm"],
                        paddingVertical: sizes.paddings["1sm"],
                        paddingHorizontal: sizes.paddings["1md"],
                        borderRadius: sizes.borderRadius["1md"],
                        backgroundColor: colors.gray.grey_09,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: fonts.family.Semibold,
                            fontSize: fonts.size.body,
                            color: colors.gray.white,
                        }}
                    >
                        {t("Try again")}
                    </Text>
                </Pressable>
            </Centered>
        )
    }

    if (previews.length === 0) {
        return (
            <Centered>
                <Title>{t("No conversations yet")}</Title>
                <Subtitle>{t("Your conversations will appear here.")}</Subtitle>
            </Centered>
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
            // O provedor pagina de 30 em 30, com offset máximo de 1000.
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            onRefresh={refresh}
            refreshing={false}
        />
    )
}

function Centered({ children }: { children: React.ReactNode }) {
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
            {children}
        </View>
    )
}

function Title({ children }: { children: React.ReactNode }) {
    return (
        <Text
            style={{
                fontFamily: fonts.family.Semibold,
                fontSize: fonts.size.headline,
                color: colors.gray.white,
                textAlign: "center",
            }}
        >
            {children}
        </Text>
    )
}

function Subtitle({ children }: { children: React.ReactNode }) {
    return (
        <Text
            style={{
                marginTop: 6,
                fontFamily: fonts.family.Regular,
                fontSize: fonts.size.body,
                color: colors.gray.grey_04,
                textAlign: "center",
            }}
        >
            {children}
        </Text>
    )
}
