import React from "react"
import { Text, View, type TextStyle, type ViewStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageReplyPreviewProps } from "../message.types"

/** Citação da mensagem respondida, com a barra vertical à esquerda. */
export default function ReplyPreview({ accentColor }: MessageReplyPreviewProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    const reply = data.replyTo
    // Mensagem apagada não mostra o que ela citava.
    if (!reply || options.messageType === "deleted") return null

    const accent = accentColor ?? (options.isMine ? colors.background : colors.primary)

    const container: ViewStyle = {
        flexDirection: "row",
        columnGap: size.gap,
        borderRadius: size.borderRadiusTight,
        backgroundColor: options.isMine ? colors.blur_display_color : colors.backgroundDisabled,
        overflow: "hidden",
    }
    const bar: ViewStyle = {
        width: 3,
        backgroundColor: accent,
    }
    const content: ViewStyle = {
        flex: 1,
        paddingVertical: size.padding / 1.5,
        paddingRight: size.padding / 1.5,
        rowGap: 2,
    }
    const author_style: TextStyle = {
        fontSize: size.fontSize * 0.85,
        fontFamily: fonts.family.Semibold,
        color: accent,
    }
    const preview_style: TextStyle = {
        fontSize: size.fontSize * 0.85,
        fontFamily: fonts.family.Regular,
        color: options.isMine ? colors.background : colors.textDisabled,
    }

    return (
        <View style={container}>
            <View style={bar} />
            <View style={content}>
                <Text style={author_style} numberOfLines={1}>
                    {reply.author?.name ?? reply.author?.username}
                </Text>
                <Text style={preview_style} numberOfLines={2}>
                    {reply.preview}
                </Text>
            </View>
        </View>
    )
}
