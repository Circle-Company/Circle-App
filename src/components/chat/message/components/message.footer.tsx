import React from "react"
import { View, type ViewStyle } from "react-native"

import MessageContext from "../context/provider"
import { MessageChildrenProps } from "../message.types"

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
    const { options, size } = React.useContext(MessageContext)

    if (!options.isLastOfGroup) return null

    const container: ViewStyle = {
        // Ocupa a linha inteira para quebrar depois da bolha, no `flexWrap` do
        // container — a mesma mecânica das reações.
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: options.isMine ? "flex-end" : "flex-start",
        columnGap: size.gap / 1.5,
        marginTop: size.gap / 3,
        // Respiro nas laterais: sem fundo próprio, o rodapé encostaria na borda da
        // conversa e pareceria colado nela.
        paddingHorizontal: size.padding * 1.5,
        // Em grupo a linha do autor começa depois do avatar; sem isto o rodapé
        // ficaria desalinhado da bolha que ele descreve.
        paddingLeft:
            options.isGroup && !options.isMine
                ? size.avatarSize + size.gap + size.padding * 1.5
                : size.padding * 1.5,
    }

    return <View style={container}>{children}</View>
}
