import { Animated, Keyboard, TextInput, View } from "react-native"
import ColorTheme, { colors } from "@/constants/colors"
import CheckIcon from "@/assets/icons/svgs/check_circle.svg"
import { CommentsInputProps } from "../comments-types"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import { apiRoutes } from "@/api"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { useToast } from "@/contexts/Toast"
import { TextStyle } from "react-native"
import { ViewStyle } from "react-native"
import { Button, Host } from "@expo/ui/swift-ui"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"

export default function Input({
    momentId,
    color = String(ColorTheme().text),
    autoFocus = false,
    onSent,
}: CommentsInputProps) {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const [commentText, setCommentText] = React.useState<string>("")
    const toast = useToast()

    const isSendingRef = React.useRef(false)
    const animatedScale = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [])
    async function sendComment() {
        const content = (commentText || "").trim()
        if (!content || isSendingRef.current) return
        isSendingRef.current = true
        try {
            await apiRoutes.moment.actions.comment({
                momentId,
                authorizationToken: session.account.jwtToken,
                content: commentText,
                mentions: [],
                parentId: "",
            })
            toast.success(t("Comment Sended with success"))
            Vibrate("notificationSuccess")
            setCommentText("")
            Keyboard.dismiss()
            onSent?.()
        } finally {
            isSendingRef.current = false
        }
    }

    const input_container: any = {
        width: sizes.screens.width - sizes.margins["1md"],
        height: sizes.inputs.height,
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: sizes.inputs.height / 2,
        paddingLeft: sizes.inputs.paddingHorizontal,
        backgroundColor: colors.gray.grey_08,
        overflow: "hidden",
        paddingRight: sizes.inputs.paddingHorizontal,
        marginBottom: sizes.margins["1sm"],
    }
    const text: TextStyle = {
        flex: 1,
        fontFamily: fonts.family.Medium,
        fontSize: 16,
        color: colors.gray.white,
    }
    const textContainer: ViewStyle = {
        marginLeft: 5,
        height: sizes.inputs.height,
        justifyContent: "center",
        flex: 1,
    }

    return (
        <View style={[input_container]}>
            <View style={textContainer}>
                <TextInput
                    style={[text, { color, paddingRight: 12 }]}
                    placeholder={t("Write your comment")}
                    placeholderTextColor={colors.gray.grey_04}
                    selectionColor={colors.purple.purple_04}
                    numberOfLines={1}
                    onChangeText={(text) => setCommentText(text)}
                    autoFocus={autoFocus}
                />
            </View>
            <Host matchContents>
                <Button
                    onPress={sendComment}
                    color={colors.purple.purple_05}
                    disabled={!(commentText || "").trim() || isSendingRef.current}
                    systemImage="paperplane.fill"
                    variant="glassProminent"
                    controlSize="regular"
                />
            </Host>
        </View>
    )
}
