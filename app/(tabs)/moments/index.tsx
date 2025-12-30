import React from "react"
import { useColorScheme } from "react-native"
import { View } from "@/components/Themed"
import { Comments } from "@/components/comment"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import FeedContext from "@/contexts/Feed"
import LanguageContext from "@/contexts/Preferences/language"
import ListMoments from "@/features/list-moments"
import { KeyboardAvoidingView, Platform } from "react-native"

export default function HomeScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { t } = React.useContext(LanguageContext)
    const { commentEnabled } = React.useContext(FeedContext)

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
