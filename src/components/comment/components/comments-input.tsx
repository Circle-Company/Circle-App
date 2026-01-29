import { Animated, Keyboard, Pressable, Text, TextInput, View, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../constants/colors"

import Arrowbottom from "@/assets/icons/svgs/paper_plane.svg"
import CheckIcon from "@/assets/icons/svgs/check_circle.svg"
import { CommentsInputProps } from "../comments-types"
import FeedContext from "@/contexts/Feed"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import api from "@/api"
import fonts from "@/constants/fonts"
import sizes from "../../../constants/sizes"
import { useToast } from "../../../contexts/Toast"
import { userReciveDataProps } from "@/components/user_show/user_show-types"
import MomentContext from "@/components/moment/context"
import { TextStyle } from "react-native"
import { ViewStyle } from "react-native"
import { Button, Host } from "@expo/ui/swift-ui"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { iOSMajorVersion } from "@/lib/platform/detection"

export default function Input({
    color = String(ColorTheme().text),
    autoFocus = false,
}: CommentsInputProps) {
    const { t } = React.useContext(LanguageContext)
    const { actions, data } = React.useContext(MomentContext)
    const { setCommentEnabled, commentEnabled } = React.useContext(FeedContext)
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
        async function fetch() {
            await sendComment().then(() => {
                setCommentText("")
                Keyboard.dismiss()
            })
        }
        fetch()
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
    const pressable_style: ViewStyle = {
        width: 40,
        height: 40,
    }

    async function sendComment() {
        const content = (commentText || "").trim()
        if (!content || isSendingRef.current) return
        isSendingRef.current = true
        try {
            await actions.registerInteraction("COMMENT", {
                momentId: data.id,
                authorizationToken: session.account.jwtToken,
                content,
            })
            toast.success(t("Comment Sended with success"))
            Vibrate("notificationSuccess")
            setCommentText("")
            Keyboard.dismiss()
            setCommentEnabled(false)
        } finally {
            isSendingRef.current = false
        }
    }

    if (commentEnabled === false) return null
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
                    onBlur={() => {
                        setCommentEnabled(false)
                    }}
                />
            </View>
            <Host matchContents>
                <Button
                    onPress={sendComment}
                    color={colors.purple.purple_05}
                    disabled={!(commentText || "").trim() || isSendingRef.current}
                    systemImage="paperplane.fill"
                    variant={iOSMajorVersion! >= 26 ? "glassProminent" : "borderedProminent"}
                    controlSize="regular"
                    modifiers={[
                        ...(iOSMajorVersion! < 26
                            ? [
                                  {
                                      $type: "cornerRadius",
                                      radius: 25,
                                  },
                              ]
                            : []),
                    ]}
                />
            </Host>
        </View>
    )
}
