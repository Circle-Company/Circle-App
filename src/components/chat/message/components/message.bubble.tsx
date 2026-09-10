import React from "react"
import { View, type ViewStyle } from "react-native"

import ColorTheme, { colors as palette } from "@/constants/colors"
import MessageContext from "../context/provider"
import MessageLayoutContext from "../context/layout.context"
import { MessageChildrenProps } from "../message.types"

/**
 * A bolha em si: fundo, raio dos cantos e limite de largura.
 *
 * O canto "colado" (`borderRadiusTight`) é o de baixo do lado de quem enviou,
 * e só na última mensagem de uma sequência do mesmo autor — é o que dá o
 * rabinho visual sem desenhar um triângulo.
 */
export default function BubbleRoot({ children }: MessageChildrenProps) {
    const { options, size } = React.useContext(MessageContext)
    const rowWidth = React.useContext(MessageLayoutContext)
    const colors = ColorTheme()

    const tight = options.isLastOfGroup ? size.borderRadiusTight : size.borderRadius

    const container: ViewStyle = {
        // Teto em px sobre a largura medida da linha. Em porcentagem ele se
        // resolveria contra o gatilho do menu de ações — a camada que envolve a
        // bolha —, cuja largura é a do texto, não a da conversa.
        maxWidth: rowWidth > 0 ? rowWidth * size.maxWidthRatio : `${size.maxWidthRatio * 100}%`,
        padding: size.padding,
        rowGap: size.gap / 2,
        // Enviada: roxo bem claro (`primaryAccent` = purple_00). O `primary` cheio
        // pesava demais numa lista inteira de bolhas, e o texto sobre ele exigia
        // cor invertida; sobre o claro o texto normal já contrasta.
        // Recebida em cinza bem escuro, e não no preto do fundo: no preto a bolha
        // se dissolvia na conversa e só a mancha do texto marcava onde ela estava.
        //
        // Vem da paleta direta porque o tema não tem um token para "superfície um
        // passo acima do fundo" — é isso que falta aqui, e inventar um significado
        // novo para `backgroundDisabled` seria pior.
        backgroundColor: options.isMine ? colors.primaryAccent : palette.gray.grey_08,
        borderRadius: size.borderRadius,
        borderBottomRightRadius: options.isMine ? tight : size.borderRadius,
        borderBottomLeftRadius: options.isMine ? size.borderRadius : tight,
        borderWidth: options.isSelected ? 1 : 0,
        borderColor: colors.primary,
    }

    return <View style={container}>{children}</View>
}
