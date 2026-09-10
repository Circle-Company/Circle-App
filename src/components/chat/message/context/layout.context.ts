import React from "react"

/**
 * Teto de largura da bolha, em px, já calculado pela linha.
 *
 * Publica o **limite final**, e não a largura da linha para a bolha multiplicar depois. A
 * razão é que o teto não é o mesmo em toda mensagem: quando há avatar ao lado, ele precisa
 * descontar o vão do avatar para que o conjunto — foto mais bolha — termine na mesma coluna
 * em que uma mensagem simples termina. Esse desconto é conhecimento da linha, que sabe se o
 * avatar existe; a bolha só obedece ao número.
 *
 * Em porcentagem o limite se resolveria contra o **pai direto** da bolha, que é o gatilho do
 * menu de ações — uma camada que existe por causa do menu nativo e cuja largura é a do texto.
 * O resultado era um teto errado e a bolha fora do lugar.
 */
const MessageLayoutContext = React.createContext<number>(0)

export default MessageLayoutContext
