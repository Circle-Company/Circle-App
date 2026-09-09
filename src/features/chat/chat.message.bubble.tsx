import React from "react"
import { Text, View } from "react-native"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

import type { BubbleGroupPosition, ChatBubbleMessage } from "./chat.types"

type ChatMessageBubbleProps = {
    message: ChatBubbleMessage
}

/** Raio grande = canto externo do bloco; pequeno = canto interno, entre duas mensagens
 * seguidas do mesmo autor. É essa diferença que produz o encadeamento do iMessage. */
const RADIUS_OUTER = 18
const RADIUS_INNER = 5

/**
 * Cantos da bolha conforme o lado e a posição no bloco.
 *
 * A regra do iMessage: os cantos que "olham" para a mensagem vizinha do mesmo autor ficam
 * quase retos; os demais, arredondados. Do lado de quem envia (direita) isso acontece na
 * borda direita; de quem recebe, na esquerda.
 */
function cornerRadii(mine: boolean, position: BubbleGroupPosition) {
    const attachedTop = position === "middle" || position === "last"
    const attachedBottom = position === "middle" || position === "first"

    return {
        borderTopLeftRadius: !mine && attachedTop ? RADIUS_INNER : RADIUS_OUTER,
        borderBottomLeftRadius: !mine && attachedBottom ? RADIUS_INNER : RADIUS_OUTER,
        borderTopRightRadius: mine && attachedTop ? RADIUS_INNER : RADIUS_OUTER,
        borderBottomRightRadius: mine && attachedBottom ? RADIUS_INNER : RADIUS_OUTER,
    }
}

/**
 * Uma bolha de mensagem no estilo iMessage.
 *
 * `blue_05` é `#007AFF` — o mesmo azul do iMessage, e já existia na paleta do app, então
 * não foi preciso introduzir cor nova. O lado recebido usa `grey_07` (`#282828`), que é o
 * cinza do modo escuro.
 */
export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
    const { text, mine, status, groupPosition = "single" } = message

    const failed = status === "failed"
    const background = mine
        ? failed
            ? colors.red.red_05
            : colors.blue.blue_05
        : colors.gray.grey_07

    return (
        <View
            style={{
                width: "100%",
                paddingHorizontal: sizes.paddings["2sm"],
                // Mensagens encadeadas ficam coladas; um bloco novo respira.
                marginTop: groupPosition === "middle" || groupPosition === "last" ? 2 : 8,
                alignItems: mine ? "flex-end" : "flex-start",
            }}
        >
            <View
                style={{
                    // O teto de 75% é o que garante que uma mensagem longa continue
                    // legível como bolha, em vez de virar um bloco de largura total.
                    maxWidth: "75%",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: background,
                    ...cornerRadii(mine, groupPosition),
                }}
            >
                <Text
                    style={{
                        fontFamily: fonts.family.Regular,
                        fontSize: fonts.size.callout,
                        lineHeight: fonts.size.callout * 1.3,
                        color: mine ? colors.gray.white : colors.gray.grey_02,
                    }}
                >
                    {text}
                </Text>
            </View>

            {/* O status só aparece na última bolha do bloco — repetir a cada mensagem
                seguida é ruído, e é assim que o iMessage se comporta. */}
            {mine && (groupPosition === "single" || groupPosition === "last") && status ? (
                <Text
                    style={{
                        marginTop: 2,
                        marginRight: 4,
                        fontFamily: fonts.family.Regular,
                        fontSize: fonts.size.caption2,
                        color: failed ? colors.red.red_05 : colors.gray.grey_04,
                    }}
                >
                    {status}
                </Text>
            ) : null}
        </View>
    )
}
