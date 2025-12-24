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
import { KeyboardAvoidingView, Platform } from "react-native"

export default function HomeScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { t } = React.useContext(LanguageContext)
    const { setCurrentTab } = React.useContext(BottomTabsContext)
    const { commentEnabled, setCommentEnabled, keyboardIsVisible } = React.useContext(FeedContext)
    const { height } = useKeyboard()
    const isFocused = useIsFocused()

    React.useEffect(() => {
        setCurrentTab("Home")
    }, [isFocused])

    const container: ViewStyle = {
        alignItems: "center",
        flex: 1,
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={sizes.screens.height * 0.14} // ajuste se tiver header/tabbar
        >
            <View style={{ flex: 1 }}>
                <ListMoments />

                {commentEnabled && (
                    <Comments.Input
                        preview={false}
                        placeholder={t("Send Comment")}
                        color={
                            isDarkMode ? colors.gray.white.toString() : colors.gray.black.toString()
                        }
                        backgroundColor={String(
                            isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
                        )}
                        autoFocus
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    )
}
