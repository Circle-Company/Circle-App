import { useIsFocused } from "@react-navigation/native"
import React, { useEffect, useRef } from "react"
import { Animated, Keyboard, useColorScheme, ViewStyle } from "react-native"
import StatusBar from "../../../components/StatusBar"
import { View } from "../../../components/Themed"
import { Comments } from "../../../components/comment"
import ColorTheme, { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import FeedContext from "../../../contexts/Feed"
import LanguageContext from "../../../contexts/Preferences/language"
import BottomTabsContext from "../../../contexts/bottomTabs"
import ListMoments from "../../../features/list-moments"
import { useKeyboard } from "../../../lib/hooks/useKeyboard"

export default function HomeScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { t } = React.useContext(LanguageContext)
    const { setCurrentTab } = React.useContext(BottomTabsContext)
    const { commentEnabled, setCommentEnabled, keyboardIsVisible } = React.useContext(FeedContext)
    const { height } = useKeyboard()
    const isFocused = useIsFocused()

    const bottomContainerRef = useRef(null)
    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setCommentEnabled(false)
        })
        return () => {
            keyboardDidHideListener.remove()
        }
    }, [])

    React.useEffect(() => {
        setCurrentTab("Home")
    }, [isFocused])

    const container: ViewStyle = {
        alignItems: "center",
        flex: 1,
    }

    const bottomContainer: ViewStyle = {
        bottom: 0,
        paddingVertical: sizes.paddings["1sm"] * 0.4,
        paddingHorizontal: sizes.paddings["2sm"] * 0.8,
        width: sizes.screens.width,
        borderTopWidth: sizes.borders["1md"] * 0.7,
        borderColor: isDarkMode ? colors.transparent.white_10 : colors.transparent.black_10,
        backgroundColor: ColorTheme().background,
        //@ts-ignore
        transform: [{ translateY: height }],
    }

    return (
        <View style={container}>
            <ListMoments />
            {commentEnabled && (
                <Animated.View ref={bottomContainerRef} style={bottomContainer}>
                    <Comments.Input
                        preview={false}
                        placeholder={t("Send Comment")}
                        color={
                            isDarkMode ? colors.gray.white.toString() : colors.gray.black.toString()
                        }
                        backgroundColor={String(
                            isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
                        )}
                        autoFocus={!!keyboardIsVisible}
                    />
                </Animated.View>
            )}
        </View>
    )
}
