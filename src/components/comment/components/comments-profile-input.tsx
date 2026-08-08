import { Animated, Keyboard, Pressable, TextInput, View } from "react-native"
import ColorTheme, { colors } from "@/constants/colors"
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
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"
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

    const handleButtonPress = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true,
        }).start()
        sendComment()
    }

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
        } catch {
            toast.error(t("Fail to send comment"))
            Vibrate("notificationError")
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
        paddingRight: sizes.inputs.paddingHorizontal * 0.5,
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
    const sendButton: ViewStyle = {
        width: 60,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    }

    const canSend = (commentText || "").trim().length > 0 && !isSendingRef.current

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
                    value={commentText}
                />
            </View>
            <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
                <Pressable
                    onPress={handleButtonPress}
                    disabled={!canSend}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={t("Send")}
                    style={({ pressed }) => ({ opacity: pressed && canSend ? 0.85 : 1 })}
                >
                    {isLiquidGlassAvailable() ? (
                        <GlassView
                            glassEffectStyle="regular"
                            isInteractive
                            colorScheme="dark"
                            tintColor={canSend ? colors.purple.purple_05 : undefined}
                            style={sendButton}
                        >
                            <SymbolView
                                name="paperplane.fill"
                                size={18}
                                tintColor={canSend ? colors.gray.white : colors.gray.grey_04}
                            />
                        </GlassView>
                    ) : (
                        <View
                            style={[
                                sendButton,
                                {
                                    backgroundColor: canSend
                                        ? colors.purple.purple_05
                                        : colors.gray.grey_07,
                                },
                            ]}
                        >
                            <SymbolView
                                name="paperplane.fill"
                                size={18}
                                tintColor={canSend ? colors.gray.white : colors.gray.grey_04}
                            />
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        </View>
    )
}
