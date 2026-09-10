import React from "react"
import { View, type ViewStyle } from "react-native"

import ColorTheme, { colors as palette } from "@/constants/colors"
import MessageContext from "../context/provider"
import MessageLayoutContext from "../context/layout.context"
import appSizes from "@/constants/sizes"
import { MessageChildrenProps } from "../message.types"

/**
 * Opacidade da bolha enviada quando a mensagem foi apagada.
 *
 * Vale para a enviada apenas: a recebida recua trocando de tom na paleta, e cair de
 * opacidade também a jogaria contra o fundo preto até sumir.
 */
const DELETED_SENT_OPACITY = 0.45

/**
 * A bolha em si: fundo, raio dos cantos e limite de largura.
 *
 * O canto "colado" (`borderRadiusTight`) é o de baixo do lado de quem enviou,
 * e só na última mensagem de uma sequência do mesmo autor — é o que dá o
 * rabinho visual sem desenhar um triângulo.
 */
export default function BubbleRoot({ children }: MessageChildrenProps) {
    const { options, size } = React.useContext(MessageContext)
    const bubbleMaxWidth = React.useContext(MessageLayoutContext)
    // Teto de segurança enquanto a linha ainda não se mediu.
    const windowWidth = appSizes.window.width
    const colors = ColorTheme()

    const tight = options.isLastOfGroup ? size.borderRadiusTight : size.borderRadius
    const isDeleted = options.messageType === "deleted"

    const container: ViewStyle = {
        // Teto já calculado pela linha (ver `MessageLayoutContext`): ele desconta o vão do
        // avatar quando existe, para foto + bolha terminarem na mesma coluna de uma bolha
        // simples. O fallback só vale antes de a linha publicar o valor.
        maxWidth: bubbleMaxWidth > 0 ? bubbleMaxWidth : windowWidth * size.maxWidthRatio,
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
        //
        // Apagada recua um plano: a lápide é registro de que algo existiu, não conteúdo, e
        // não deve competir com as mensagens vivas ao redor.
        //   - recebida: um degrau mais escuro na paleta (`grey_09`), que já é a mesma
        //     direção do fundo;
        //   - enviada: o roxo não tem "um degrau mais escuro" que continue lendo como roxo,
        //     então o recuo é por opacidade — ver `opacity` abaixo.
        backgroundColor: options.isMine
            ? colors.primaryAccent
            : isDeleted
              ? palette.gray.grey_09
              : palette.gray.grey_08,
        // Só a bolha enviada apagada; a recebida já recuou pela cor.
        opacity: isDeleted && options.isMine ? DELETED_SENT_OPACITY : 1,
        borderRadius: size.borderRadius,
        borderBottomRightRadius: options.isMine ? tight : size.borderRadius,
        borderBottomLeftRadius: options.isMine ? size.borderRadius : tight,
        borderWidth: options.isSelected ? 1 : 0,
        borderColor: colors.primary,
    }

    return <View style={container}>{children}</View>
}
