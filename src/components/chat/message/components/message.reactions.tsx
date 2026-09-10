import React from "react"
import { Pressable, Text, View, type TextStyle, type ViewStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageReactionsProps } from "../message.types"

/** Pílulas de reação ancoradas abaixo da bolha. */
function Reactions({ onPressReaction }: MessageReactionsProps) {
    const { actions, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    if (!options.enableReactions || !actions.reactions.length) return null

    /*
     * As pílulas ocupam a linha inteira e se alinham ao lado da bolha.
     *
     * O `width: "100%"` é herança da época em que o `Container` era um `flexWrap` e as
     * reações precisavam forçar a quebra para não ficarem ao lado da bolha. Hoje elas são um
     * item da coluna da mensagem, que já empilha — o `100%` continua porque é ele que dá à
     * linha a largura contra a qual o `justifyContent` alinha.
     *
     * **Sem margem negativa.** Ela existia para subir as pílulas até encostarem na base da
     * bolha, e fazia sentido quando eram vizinhas diretas dela. Na coluna atual as reações vêm
     * depois do rodapé, então o que a margem negativa puxava para cima era o rodapé — e a
     * altura da linha passava a depender de qual dos dois existia. Um respiro pequeno e
     * positivo mantém a ligação visual com a bolha sem sobrepor nada.
     */
    const container: ViewStyle = {
        width: "100%",
        flexDirection: "row",
        columnGap: size.gap / 2,
        justifyContent: options.isMine ? "flex-end" : "flex-start",
        marginTop: size.gap / 3,
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

/**
 * Memoizado: dentro de uma conversa a mensagem re-renderiza por motivos que não são deste
 * componente — o principal é o progresso da nota de voz, que chega várias vezes por segundo
 * como prop da árvore. Sem `memo`, cada tique redesenhava também texto, hora, status e
 * rótulos, que não mudaram.
 */
export default React.memo(Reactions)
