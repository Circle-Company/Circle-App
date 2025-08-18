import React, { useRef } from "react"
import { Animated as RNAnimated, StatusBar, ViewStyle, useColorScheme } from "react-native"
import { useAnimatedStyle } from "react-native-reanimated"
import { Comments } from "../../../components/comment"
import { View } from "../../../components/Themed"
import ColorTheme, { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import FeedContext from "../../../contexts/Feed"
import LanguageContext from "../../../contexts/Preferences/language"
import RenderMomentFull from "../../../features/list-moments/components/moments/render-moment-full"
import { useKeyboard } from "../../../lib/hooks/useKeyboard"

export default function MomentFullScreen() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const { focusedMoment } = React.useContext(FeedContext)

    // Seu hook customizado que retorna { height, visible, progress }
    const keyboardY = useKeyboard()
    const bottomContainerRef = useRef(null)

    const container: ViewStyle = {
        alignItems: "center",
        overflow: "hidden",
        flex: 1,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    }

    const bottomContainerBase: ViewStyle = {
        bottom: 0,
        paddingVertical: sizes.paddings["1sm"] * 0.4,
        width: sizes.screens.width,
        borderTopWidth: sizes.borders["1md"] * 0.7,
        borderColor: isDarkMode ? colors.transparent.white_10 : colors.transparent.black_10,
        backgroundColor: ColorTheme().background,
    }

    // Usar o height do hook no animated style
    const bottomContainerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -keyboardY.height.value }],
    }))

    return (
        <View style={container}>
            <StatusBar
                translucent={false}
                backgroundColor={String(colors.gray.black)}
                barStyle={"light-content"}
            />
            <RenderMomentFull
                momentData={focusedMoment}
                isFocused={true}
                fromFeed={true}
                fromAccount={false}
            />
            <RNAnimated.View
                ref={bottomContainerRef}
                style={[bottomContainerBase, bottomContainerAnimatedStyle]}
            >
                <Comments.Input
                    preview={false}
                    placeholder={t("Send Comment")}
                    color={isDarkMode ? colors.gray.white.toString() : colors.gray.black.toString()}
                    backgroundColor={String(isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01)}
                    autoFocus={false}
                />
            </RNAnimated.View>
        </View>
    )
}
