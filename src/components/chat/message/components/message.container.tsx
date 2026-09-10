import React from "react"
import { View, type LayoutChangeEvent, type ViewStyle } from "react-native"

import MessageContext from "../context/provider"
import MessageLayoutContext from "../context/layout.context"
import { MessageContainerProps } from "../message.types"

/**
 * Linha horizontal da mensagem: avatar do autor | bolha, com as reações logo
 * abaixo.
 *
 * O avatar chega pronto por prop (`avatar`) porque é um componente do app, e não
 * do chat. Aqui só se decide o posicionamento: ele aparece na última mensagem de
 * uma sequência em grupo, e nas demais o espaço dele fica reservado por um vão
 * da mesma largura — sem isso as bolhas da sequência ficariam desalinhadas.
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

    const showAvatarSlot = options.isGroup && !options.isMine

    const container: ViewStyle = {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: options.isMine ? "flex-end" : "flex-start",
        columnGap: size.gap,
        marginTop: options.isFirstOfGroup ? size.gap * 2 : size.gap / 2,
        backgroundColor,
    }

    return (
        <View style={container} onLayout={onLayout}>
            {showAvatarSlot ? (
                <View style={{ width: size.avatarSize }}>
                    {options.isLastOfGroup ? avatar : null}
                </View>
            ) : null}
            <MessageLayoutContext.Provider value={width}>{children}</MessageLayoutContext.Provider>
        </View>
    )
}
