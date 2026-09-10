import React from "react"
import { Animated, Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import { REVEAL_WIDTH } from "./chat.list.reveal"

/**
 * Horário que aparece à direita da mensagem quando a lista é arrastada.
 *
 * Fica fora da bolha de propósito: dentro dela o horário é da mensagem (e só
 * aparece na última de um bloco); aqui ele é da **linha**, e responde a um gesto
 * da lista. São informações com donos diferentes.
 *
 * A opacidade acompanha o arrasto — sem isso o texto ficaria parado à direita,
 * visível pela metade sempre que a lista se mexesse um pouco.
 */
function ChatListTimestamp({ date, translateX }: { date: string; translateX: Animated.Value }) {
    const colors = ColorTheme()

    const label = React.useMemo(() => {
        const parsed = new Date(date)
        if (Number.isNaN(parsed.getTime())) return ""
        return parsed.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            // 24h fixo: sem isto o formato segue a região do aparelho, e a mesma
            // conversa mostraria "2:05 PM" para uns e "14:05" para outros.
            hour12: false,
        })
    }, [date])

    const style: TextStyle = {
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Regular,
        color: colors.textDisabled,
    }

    const opacity = translateX.interpolate({
        inputRange: [-REVEAL_WIDTH, -REVEAL_WIDTH / 2, 0],
        outputRange: [1, 0.35, 0],
        extrapolate: "clamp",
    })

    return (
        <Animated.View
            style={{
                position: "absolute",
                right: -REVEAL_WIDTH,
                width: REVEAL_WIDTH,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                opacity,
            }}
        >
            <Text style={style}>{label}</Text>
        </Animated.View>
    )
}

export default React.memo(ChatListTimestamp)
