import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import LanguageContext from "@/contexts/language"
import MessageContext from "../context/provider"
import fonts from "@/constants/fonts"
import { MessageStatusProps } from "../message.types"

/**
 * Estado de entrega, por extenso: "enviando", "enviado", "recebido", "lido".
 *
 * Palavra em vez de tique. O tique é convenção herdada que precisa ser
 * aprendida — um risco, dois riscos, dois riscos coloridos — e, no rodapé fora
 * da bolha, há espaço para dizer a mesma coisa sem ambiguidade.
 *
 * Só aparece nas mensagens que EU enviei: o estado de leitura de uma mensagem
 * recebida não existe do lado de cá.
 */
export default function MessageStatus({ color, size: sizeProp }: MessageStatusProps) {
    const { actions, options, size } = React.useContext(MessageContext)
    const { t } = React.useContext(LanguageContext)
    const colors = ColorTheme()

    if (!options.isMine) return null

    const label = {
        pending: t("Sending"),
        sent: t("Sent"),
        delivered: t("Delivered"),
        read: t("Read"),
        failed: t("Failed"),
    }[actions.status]

    const style: TextStyle = {
        fontSize: sizeProp ?? size.fontSize * 0.75,
        // "Lido" se distingue pelo **peso**, não pela cor: é o estado que se
        // procura ao correr o olho, e destacá-lo também em cor o transformaria num
        // aviso — quando ele é só a conclusão normal de uma mensagem.
        fontFamily: actions.status === "read" ? fonts.family.Semibold : fonts.family.Regular,
        // Só a falha muda de cor: ali há algo a fazer.
        color: color ?? (actions.status === "failed" ? colors.error : colors.textDisabled),
    }

    return <Text style={style}>{label}</Text>
}
