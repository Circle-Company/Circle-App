import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import MessageContext from "../context/provider"
import { resolveLinkOnly } from "../helpers/resolveLinkOnly"

/**
 * A linha "clique para abrir", sob uma mensagem que é só um link.
 *
 * Aparece sozinha, lendo o contexto — como os demais blocos da mensagem. Quem monta a árvore
 * não precisa saber se a mensagem é um link: a condição vive aqui.
 *
 * **Só quando a mensagem é apenas o endereço.** Um link no meio de uma frase não ganha a
 * dica: ali o texto já diz o que o link é, e a linha extra viraria ruído repetido em toda
 * conversa que compartilha alguma coisa.
 *
 * Numa mensagem apagada não aparece: a lápide não tem destino para abrir.
 */
function MessageLinkHint() {
    const { data, options, size } = React.useContext(MessageContext)
    const { t } = React.useContext(LanguageContext)
    const colors = ColorTheme()

    const isDeleted = options.messageType === "deleted"
    const link = isDeleted ? null : resolveLinkOnly(data.content)

    if (!link) return null

    const style: TextStyle = {
        // Escala de metadado, como "editada" e "encaminhada": a dica explica a mensagem, não
        // é a mensagem.
        fontSize: size.fontSize * 0.8,
        fontFamily: fonts.family.Regular,
        // Na bolha enviada o fundo é claro, então o texto secundário escurece; na recebida
        // ele clareia. `textDisabled` funciona nas duas, mas some sobre o roxo claro.
        color: options.isMine ? colors.textAccent : colors.textDisabled,
    }

    return <Text style={style}>{t("Click to open")}</Text>
}

/**
 * Memoizado como as outras folhas: a mensagem re-renderiza por motivos que não são deste
 * componente — o progresso da nota de voz é o principal.
 */
export default React.memo(MessageLinkHint)
