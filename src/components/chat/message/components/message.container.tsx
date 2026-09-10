import React from "react"
import { View, type ViewStyle } from "react-native"

import MessageContext from "../context/provider"
import MessageLayoutContext from "../context/layout.context"
import { MessageContainerProps } from "../message.types"
import appSizes from "@/constants/sizes"
import { avatarSide, drawsAvatar, hasAvatarSlot } from "../helpers/avatarSlot"

/**
 * Linha horizontal da mensagem: avatar do autor | bolha, com as reações logo
 * abaixo.
 *
 * O avatar chega pronto por prop (`avatar`) porque é um componente do app, e não
 * do chat. Aqui só se decide o posicionamento: de que lado ele fica (o mesmo da
 * bolha) e quando aparece — ver `hasAvatarSlot`.
 *
 * `flexWrap` é o que permite as reações serem filhas diretas daqui: elas se
 * declaram com `width: "100%"`, então quebram para a própria linha em vez de
 * disputarem espaço lateral com a bolha.
 */
export default function Container({ children, avatar, backgroundColor }: MessageContainerProps) {
    const { options, size } = React.useContext(MessageContext)

    const showAvatarSlot = hasAvatarSlot(options)
    const side = avatarSide(options)

    /**
     * Teto de largura da bolha, **calculado** em vez de medido.
     *
     * Antes vinha de um `onLayout` guardado em estado. Numa lista reciclada isso estica a
     * bolha: a FlashList reaproveita a view, o estado sobrevive à troca, e o primeiro quadro
     * da linha nova usa a largura da linha antiga. Também custava uma passada de layout por
     * linha.
     *
     * O teto é o **mesmo para toda mensagem**: uma fração da largura útil da conversa. Quando
     * a linha tem avatar ao lado — nota de voz, ou conversa de grupo — o vão dele é descontado
     * desse teto, e não da largura antes da fração. É o que faz o conjunto foto + bolha
     * terminar exatamente na mesma coluna em que uma bolha simples termina, em vez de ficar
     * mais estreito e desalinhado dela.
     */
    const usableWidth = appSizes.window.width - appSizes.paddings["1sm"] * 2
    const avatarSlotWidth = showAvatarSlot ? size.avatarSize + size.gap : 0
    const bubbleMaxWidth = usableWidth * size.maxWidthRatio - avatarSlotWidth

    const row: ViewStyle = {
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-end",
        columnGap: size.gap,
        /*
         * Respiro acima da linha.
         *
         * Bloco novo respira; dentro do bloco as mensagens ficam coladas. A exceção é seguir
         * uma nota de voz do mesmo autor: a linha do áudio é mais alta e sempre desenha o
         * avatar, então a mensagem de baixo — inclusive outra nota de voz — encostava nela com
         * o respiro de dentro do bloco.
         */
        marginTop:
            (options.isFirstOfGroup ? size.gap * 2 : size.gap / 2) +
            (options.followsAudio ? size.gap * 1.5 : 0),
        backgroundColor,
    }

    // Coluna da mensagem: bolha, rodapé e reações empilhados.
    //
    // Ela existe porque o avatar é irmão dela na linha. Antes tudo era filho
    // direto de um `flexWrap`, e o avatar — que vem depois na ordem quando fica à
    // direita — era empurrado para baixo do rodapé em vez de ficar ao lado da
    // bolha.
    //
    // `flex: 1` para ocupar o que sobra da linha: é dessa largura que a bolha tira
    // o próprio teto (ver `MessageLayoutContext`), e ela precisa descontar o
    // avatar.
    const column: ViewStyle = {
        flex: 1,
        alignItems: options.isMine ? "flex-end" : "flex-start",
    }

    // O vão fica reservado em todas as mensagens do bloco, para as bolhas ficarem na mesma
    // coluna; quem decide se o rosto é desenhado nele é o `drawsAvatar`.
    const avatarSlot = showAvatarSlot ? (
        <View
            style={{
                width: size.avatarSize,
                // A linha alinha pelo rodapé, então uma folga embaixo levanta o avatar. Na
                // nota de voz ele fica ao lado de uma bolha alta, e encostado na base parecia
                // pendurado; um pouco acima ele se alinha ao corpo do player.
                paddingBottom: options.messageType === "audio" ? size.gap : 0,
            }}
        >
            {drawsAvatar(options) ? avatar : null}
        </View>
    ) : null

    return (
        <View style={row}>
            {side === "left" ? avatarSlot : null}
            <View style={column}>
                <MessageLayoutContext.Provider value={bubbleMaxWidth}>
                    {children}
                </MessageLayoutContext.Provider>
            </View>
            {side === "right" ? avatarSlot : null}
        </View>
    )
}
