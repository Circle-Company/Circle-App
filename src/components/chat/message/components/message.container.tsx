import React from "react"
import { View, type LayoutChangeEvent, type ViewStyle } from "react-native"

import MessageContext from "../context/provider"
import MessageLayoutContext from "../context/layout.context"
import { MessageContainerProps } from "../message.types"
import { avatarSide, hasAvatarSlot } from "../helpers/avatarSlot"

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

    // Largura da linha, publicada para a bolha calcular o próprio teto em px.
    const [width, setWidth] = React.useState(0)
    const onLayout = React.useCallback((event: LayoutChangeEvent) => {
        setWidth(event.nativeEvent.layout.width)
    }, [])

    const showAvatarSlot = hasAvatarSlot(options)
    const side = avatarSide(options)

    const row: ViewStyle = {
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-end",
        columnGap: size.gap,
        marginTop: options.isFirstOfGroup ? size.gap * 2 : size.gap / 2,
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

    // Só na última da sequência o avatar é desenhado; nas demais o vão continua
    // reservado, para as bolhas do bloco ficarem na mesma coluna.
    const avatarSlot = showAvatarSlot ? (
        <View style={{ width: size.avatarSize }}>{options.isLastOfGroup ? avatar : null}</View>
    ) : null

    return (
        <View style={row}>
            {side === "left" ? avatarSlot : null}
            <View style={column} onLayout={onLayout}>
                <MessageLayoutContext.Provider value={width}>
                    {children}
                </MessageLayoutContext.Provider>
            </View>
            {side === "right" ? avatarSlot : null}
        </View>
    )
}
