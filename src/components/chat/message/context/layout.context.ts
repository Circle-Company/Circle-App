import React from "react"

/**
 * Largura útil da linha da mensagem, medida em tempo de layout.
 *
 * A bolha limita a própria largura a uma fração dessa medida. Em porcentagem o
 * limite se resolveria contra o **pai direto** dela, que é o gatilho do menu de
 * ações — uma camada que existe por causa do menu nativo e cuja largura é a do
 * texto. O resultado era um teto errado e a bolha fora do lugar.
 *
 * `0` significa "ainda não medido"; nesse caso a bolha volta à porcentagem.
 */
const MessageLayoutContext = React.createContext<number>(0)

export default MessageLayoutContext
