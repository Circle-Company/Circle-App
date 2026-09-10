import React from "react"
import { Pressable, Text, View, type TextStyle, type ViewStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageReactionsProps } from "../message.types"

/** Pílulas de reação ancoradas abaixo da bolha. */
export default function Reactions({ onPressReaction }: MessageReactionsProps) {
    const { actions, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    if (!options.enableReactions || !actions.reactions.length) return null

    // `width: "100%"` força a quebra de linha dentro do `Container`, que é um
    // row com `flexWrap`: assim as pílulas caem sob a bolha em vez de ao lado.
    const container: ViewStyle = {
        width: "100%",
        flexDirection: "row",
        columnGap: size.gap / 2,
        justifyContent: options.isMine ? "flex-end" : "flex-start",
        // Sobe as pílulas para encostarem na base da bolha.
        marginTop: -size.gap,
        // Sem reserva para o avatar: ele é irmão desta coluna, não parte dela.
    }

    return (
        <View style={container}>
            {actions.reactions.map((reaction) => {
                const pill: ViewStyle = {
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 3,
                    paddingHorizontal: size.padding / 1.5,
                    paddingVertical: 2,
                    borderRadius: size.borderRadius,
                    backgroundColor: colors.background,
                    borderWidth: reaction.reactedByMe ? 1 : 0,
                    borderColor: colors.primary,
                }
                const count_style: TextStyle = {
                    fontSize: size.fontSize * 0.75,
                    fontFamily: fonts.family.Semibold,
                    color: colors.text,
                }

                return (
                    <Pressable
                        key={reaction.emoji}
                        style={pill}
                        onPress={() => onPressReaction?.(reaction.emoji)}
                    >
                        <Text style={{ fontSize: size.fontSize * 0.8 }}>{reaction.emoji}</Text>
                        {reaction.count > 1 ? (
                            <Text style={count_style}>{reaction.count}</Text>
                        ) : null}
                    </Pressable>
                )
            })}
        </View>
    )
}
