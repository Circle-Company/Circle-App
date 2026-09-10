import React from "react"
import { View, type ViewStyle } from "react-native"

import MessageContext from "../context/provider"
import { MessageChildrenProps } from "../message.types"
import { hasFooterContent, showsReplies } from "../helpers/footerContent"

/**
 * Rodapé da mensagem: "editada" e tiques de entrega.
 *
 * Fica **fora da bolha**, na linha da conversa, e sem fundo próprio: o que ele
 * diz é sobre o envio, não sobre o conteúdo — misturar isso dentro da bolha
 * fazia a informação disputar espaço com o texto e empurrá-lo para cima.
 *
 * Só aparece na última mensagem de uma sequência do mesmo autor. Numa sequência
 * as mensagens saem em segundos umas das outras, então repetir o estado em cada
 * uma é ruído: o que interessa é o estado do bloco, e ele está na última.
 *
 * A hora não está mais aqui — quem a mostra é o arrasto da lista, que revela o
 * horário de cada mensagem à direita.
 */
export default function Footer({ children }: MessageChildrenProps) {
    const { actions, data, options, size } = React.useContext(MessageContext)

    // Regra do rodapé: aparece no fim do bloco, ou antes dele quando há algo dito
    // sobre *aquela* mensagem em particular — hoje, as respostas que ela recebeu.
    const hasOwnInfo = showsReplies(data, options)
    if (!options.isLastOfGroup && !hasOwnInfo) return null

    /*
     * E não aparece **vazio**.
     *
     * Fechar um bloco não é, sozinho, motivo para desenhar a caixa: numa mensagem recebida
     * sem edição e sem respostas os três filhos devolvem `null`, e o que sobrava era uma view
     * invisível com margem e padding vertical. O bloco seguinte ficava mais afastado que o
     * anterior sem nada explicar a diferença — o espaçamento irregular entre as mensagens
     * vinha daqui. Ver `helpers/footerContent`.
     */
    if (!hasFooterContent(data, options, actions.status)) return null

    const container: ViewStyle = {
        // Ocupa a linha inteira: é ela que dá a largura contra a qual o `justifyContent`
        // alinha o rodapé ao lado da bolha.
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: options.isMine ? "flex-end" : "flex-start",
        columnGap: size.gap / 1.5,
        marginTop: size.gap / 3,
        // Respiro nas laterais: sem fundo próprio, o rodapé encostaria na borda da
        // conversa e pareceria colado nela.
        paddingHorizontal: size.padding * 1.5,
        // E na vertical, para ele não ficar espremido entre a bolha e a mensagem seguinte.
        // Sai do `gap` do preset, então acompanha o tamanho escolhido em vez de fixar px.
        paddingVertical: size.gap / 2,
        // Sem reserva para o avatar: ele é irmão desta coluna, não parte dela.
    }

    return <View style={container}>{children}</View>
}
