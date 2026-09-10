import React from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { Stack, useLocalSearchParams } from "expo-router"
import { useHeaderHeight } from "expo-router/react-navigation"
import type { Channel as StreamChannel } from "stream-chat"
import { Channel, Chat, MessageComposer, MessageList, OverlayProvider } from "stream-chat-expo"

import { stripType } from "@/features/chat"
import { chatSdkTheme } from "@/features/chat/sdk/chat.sdk.theme"
import { useChat } from "@/contexts/Chat"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"

/**
 * A mesma conversa, desenhada pelos componentes do `stream-chat-expo`.
 *
 * **É um protótipo de comparação, não a tela de produção.** Ele existe para se ver lado a
 * lado, no mesmo aparelho e na mesma conversa, o que o SDK entrega pronto e o que a nossa
 * conversa (`app/(tabs)/chat/[cid].tsx`) já faz — antes de decidir se vale trocar uma pela
 * outra. Nenhum arquivo da tela atual foi alterado por causa desta rota.
 *
 * O que o SDK traz e hoje não temos: anexos, galeria, gravador de nota de voz, reações,
 * threads, editar/apagar, visualizador de mídia em tela cheia e cache offline.
 *
 * O que se perde ao adotá-lo: a bolha, o separador de data, o arrastar-para-revelar-horário e
 * o player de nota de voz de `src/components/chat/`, que são desenho nosso.
 *
 * As cores são as do Circle (`chat.sdk.theme.ts`), inclusive num aparelho no modo claro — o
 * SDK seguiria o `useColorScheme()` do sistema se deixado por conta própria. Assim a
 * comparação é de **layout e comportamento**, que é o que está em jogo, e não de paleta.
 *
 * **Precisa de dev build novo:** `@op-engineering/op-sqlite` e `react-native-teleport` são
 * módulos nativos que vieram com o SDK. Sem rebuild, esta rota não abre.
 */
export default function ConversationSdkPrototypeScreen() {
    const { t } = React.useContext(LanguageContext)
    const { client, status } = useChat()
    const { cid } = useLocalSearchParams<{ cid: string }>()
    const headerHeight = useHeaderHeight()

    const chatId = React.useMemo(() => {
        const raw = cid ?? ""
        try {
            return stripType(decodeURIComponent(raw))
        } catch {
            return stripType(raw)
        }
    }, [cid])

    const [channel, setChannel] = React.useState<StreamChannel | null>(null)
    const [failed, setFailed] = React.useState(false)

    /*
     * O canal é aberto aqui, e não pelo `useConversation`.
     *
     * Aquele hook faz coisas que o `Channel` do SDK também faz — marcar como lido, paginar,
     * manter pendentes —, e as duas implementações disputariam o mesmo estado. Aqui o `watch`
     * é o mínimo para entregar um canal pronto ao SDK, que assume dali em diante.
     */
    React.useEffect(() => {
        if (!client || !chatId) return

        const target = client.channel("messaging", chatId)
        let cancelled = false

        target
            .watch()
            .then(() => {
                if (!cancelled) setChannel(target)
            })
            .catch(() => {
                if (!cancelled) setFailed(true)
            })

        return () => {
            cancelled = true
            target.stopWatching().catch(() => {})
        }
    }, [client, chatId])

    if (status !== "ready" || !client) {
        return (
            <Centered>
                <Message>{t("Chat is unavailable right now.")}</Message>
            </Centered>
        )
    }

    if (failed) {
        return (
            <Centered>
                <Message>{t("This conversation is no longer available.")}</Message>
            </Centered>
        )
    }

    if (!channel) {
        return (
            <Centered>
                <ActivityIndicator color={colors.gray.grey_04} />
            </Centered>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.gray.black }}>
            <Stack.Screen options={{ headerTitle: "SDK" }} />

            {/*
             * O `OverlayProvider` fica aqui dentro, e não na árvore global do app.
             *
             * É ele que monta o menu de ações do toque longo e o visualizador de mídia em
             * tela cheia, e a documentação pede que envolva o app inteiro, acima do
             * navegador. Num protótipo isso significaria mexer em `app/_layout.tsx` — e o
             * combinado é não tocar em nada da tela atual. O custo é que o overlay fica
             * preso a esta tela: se o toque longo parecer limitado aqui, é por isso, e não
             * é como se comportaria em produção.
             */}
            <OverlayProvider value={{ style: chatSdkTheme }}>
                <Chat client={client} enableOfflineSupport={false}>
                    <Channel
                        channel={channel}
                        keyboardVerticalOffset={headerHeight}
                        topInset={headerHeight}
                    >
                        <MessageList />
                        <MessageComposer />
                    </Channel>
                </Chat>
            </OverlayProvider>
        </View>
    )
}

/*
 * `enableOfflineSupport={false}` de propósito.
 *
 * Ligado, o SDK abre um banco SQLite próprio e passa a ser mais uma fonte de verdade sobre as
 * mesmas conversas — junto do estado em memória que a tela atual já usa. Num protótipo de
 * comparação isso trocaria o que se está medindo: queremos ver a UI, não convivência de
 * caches. Se a decisão for adotar o SDK, ligar isto é um dos primeiros passos.
 */

function Centered({ children }: { children: React.ReactNode }) {
    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.gray.black,
            }}
        >
            {children}
        </View>
    )
}

function Message({ children }: { children: React.ReactNode }) {
    return (
        <Text
            style={{
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
