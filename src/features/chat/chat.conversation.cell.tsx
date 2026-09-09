import React from "react"
import { Pressable, Text, View } from "react-native"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

import { ChatAvatar } from "./chat.avatar"
import { ChatSpeechBubble } from "./chat.speech.bubble"
import type { ChatPreview } from "./chat.types"

/** Colunas do grid. Trocar aqui muda a grade inteira — a largura da célula é derivada. */
export const CHAT_GRID_COLUMNS = 3

const GRID_HORIZONTAL_PADDING = sizes.paddings["2sm"]

/** Largura de uma célula, já descontado o padding lateral da lista. */
export const CHAT_CELL_WIDTH =
    (sizes.window.width - GRID_HORIZONTAL_PADDING * 2) / CHAT_GRID_COLUMNS

const AVATAR_SIZE = Math.round(CHAT_CELL_WIDTH * 0.62)
const NAME_HEIGHT = 18

/**
 * Folga no topo para o balão em overlay.
 *
 * O balão é posicionado de forma absoluta e sobe além do topo do avatar; sem esta reserva ele
 * seria cortado pela linha de cima da grade. É espaço vazio nas células sem balão, e isso é
 * exatamente o ponto: **todas as células medem o mesmo**, com ou sem balão, então a grade
 * nunca desalinha.
 *
 * A conta é para o pior caso: duas linhas de mensagem mais a linha do `+X`.
 */
const BUBBLE_OVERHANG = 44

/** Altura fixa da célula. Constante por construção — ver `BUBBLE_OVERHANG`. */
export const CHAT_CELL_HEIGHT = BUBBLE_OVERHANG + AVATAR_SIZE + NAME_HEIGHT + 18

type ChatConversationCellProps = {
    preview: ChatPreview
    onPress: (cid: string) => void
}

/**
 * A célula do grid de conversas: avatar grande, nome embaixo.
 *
 * O **balão de fala** sobrepõe o avatar, e é **ocasional**: só aparece quando aquela pessoa
 * falou por último e ainda não foi respondida (`awaitingReply`). Conversa em dia não tem
 * balão — é o que faz o balão significar algo.
 *
 * A contagem de não lidas vive **dentro do balão**, como um `+X` em negrito, e conta as
 * mensagens **além** da que está sendo exibida: com 5 não lidas, uma aparece no balão e o
 * contador diz `+4`. Com uma só, não há o que somar e o `+X` não aparece.
 *
 * Como não há mais badge, o único sinal de não lida numa conversa **sem** balão é o nome em
 * branco e semibold. Na prática isso quase não acontece: se há mensagem não lida, ela é da
 * outra pessoa, e então `awaitingReply` é verdadeiro e o balão está lá.
 */
export function ChatConversationCell({ preview, onPress }: ChatConversationCellProps) {
    const hasUnread = preview.unread > 0
    const showBubble = Boolean(preview.awaitingReply && preview.lastMessage?.trim())

    return (
        <Pressable
            onPress={() => onPress(preview.cid)}
            style={({ pressed }) => ({
                width: CHAT_CELL_WIDTH,
                height: CHAT_CELL_HEIGHT,
                alignItems: "center",
                justifyContent: "flex-end",
                opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel={preview.name}
        >
            <View style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}>
                <ChatAvatar
                    size={AVATAR_SIZE}
                    profilePicture={preview.profilePicture}
                    name={preview.name}
                    online={preview.online}
                />

                {showBubble ? (
                    <View
                        // Ancorado pelo rodapé: o balão cresce para cima conforme o texto, em
                        // vez de descer e cobrir o rosto inteiro. `bottom` deixa o rabinho
                        // apoiado sobre o terço superior do avatar.
                        style={{
                            position: "absolute",
                            left: -(CHAT_CELL_WIDTH - AVATAR_SIZE) / 2,
                            right: -(CHAT_CELL_WIDTH - AVATAR_SIZE) / 2,
                            bottom: AVATAR_SIZE * 0.62,
                            alignItems: "center",
                        }}
                        pointerEvents="none"
                    >
                        <ChatSpeechBubble
                            text={preview.lastMessage as string}
                            // A mensagem exibida é uma das não lidas, então o que sobra é o
                            // que o `+X` anuncia.
                            extraCount={preview.unread - 1}
                            maxWidth={CHAT_CELL_WIDTH - 8}
                        />
                    </View>
                ) : null}
            </View>

            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                    height: NAME_HEIGHT,
                    lineHeight: NAME_HEIGHT,
                    maxWidth: CHAT_CELL_WIDTH - 8,
                    marginTop: 6,
                    textAlign: "center",
                    fontFamily: hasUnread ? fonts.family.Semibold : fonts.family.Regular,
                    fontSize: fonts.size.caption1,
                    color: hasUnread ? colors.gray.white : colors.gray.grey_04,
                }}
            >
                {preview.name}
            </Text>
        </Pressable>
    )
}

/** Padding lateral que a lista precisa aplicar para as contas de largura fecharem. */
export const CHAT_GRID_PADDING = GRID_HORIZONTAL_PADDING
