import React from "react"
import { Animated, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"

export type InboxTab = "general" | "invites"

type NotificationSegmentedProps = {
    value: InboxTab
    onChange: (tab: InboxTab) => void
    /** Convites recebidos pendentes — desenha o contador na aba "Invites". */
    invitesCount?: number
}

/**
 * Seletor de duas abas do inbox. Trilho escuro com um "polegar" claro que
 * desliza — mesma linguagem do segmented control do iOS, mas com a tipografia
 * do app (Black-Italic) e o contador de convites embutido.
 */
export function NotificationSegmented({
    value,
    onChange,
    invitesCount = 0,
}: NotificationSegmentedProps) {
    const { t } = React.useContext(LanguageContext)

    const trackWidth = sizes.screens.width - sizes.margins["1md"] * 2
    const thumbWidth = trackWidth / 2
    const height = sizes.buttons.height * 0.46

    const thumbOffset = React.useRef(
        new Animated.Value(value === "general" ? 0 : thumbWidth),
    ).current

    React.useEffect(() => {
        Animated.spring(thumbOffset, {
            toValue: value === "general" ? 0 : thumbWidth,
            useNativeDriver: true,
            bounciness: 0,
            speed: 18,
        }).start()
    }, [value, thumbWidth, thumbOffset])

    const track: ViewStyle = {
        width: trackWidth,
        height,
        alignSelf: "center",
        flexDirection: "row",
        borderRadius: height / 2,
        backgroundColor: colors.gray.grey_09,
        padding: 0,
        overflow: "hidden",
    }

    const thumb: ViewStyle = {
        position: "absolute",
        width: thumbWidth,
        height,
        borderRadius: height / 2,
        backgroundColor: colors.gray.grey_07,
    }

    const segment: ViewStyle = {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: sizes.margins["1sm"],
    }

    function labelStyle(active: boolean): TextStyle {
        return {
            fontFamily: fonts.family["Black-Italic"],
            fontSize: fonts.size.body * 1.05,
            color: active ? colors.gray.white : colors.gray.grey_04,
        }
    }

    const counter: ViewStyle = {
        minWidth: sizes.sizes["2sm"] * 1.15,
        height: sizes.sizes["2sm"] * 1.15,
        paddingHorizontal: 4,
        borderRadius: (sizes.sizes["2sm"] * 1.15) / 2,
        backgroundColor: colors.red.red_05,
        alignItems: "center",
        justifyContent: "center",
    }

    const counterText: TextStyle = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.caption2,
        color: colors.gray.white,
    }

    function handlePress(tab: InboxTab) {
        if (tab === value) return
        Vibrate("impactLight")
        onChange(tab)
    }

    return (
        <View style={track}>
            <Animated.View style={[thumb, { transform: [{ translateX: thumbOffset }] }]} />

            <Pressable style={segment} onPress={() => handlePress("general")}>
                <Text style={labelStyle(value === "general")}>{t("General")}</Text>
            </Pressable>

            <Pressable style={segment} onPress={() => handlePress("invites")}>
                <Text style={labelStyle(value === "invites")}>{t("Invites")}</Text>
                {invitesCount > 0 && (
                    <View style={counter}>
                        <Text style={counterText}>{invitesCount > 99 ? "99+" : invitesCount}</Text>
                    </View>
                )}
            </Pressable>
        </View>
    )
}

export default NotificationSegmented
