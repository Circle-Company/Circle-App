import { Animated, Keyboard, Pressable, Text, TextInput, View, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../constants/colors"

import Arrowbottom from "@/assets/icons/svgs/paper_plane.svg"
import CheckIcon from "@/assets/icons/svgs/check_circle.svg"
import { CommentsInputProps } from "../comments-types"
import FeedContext from "../../../contexts/Feed"
import LanguageContext from "../../../contexts/language"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import LinearGradient from "react-native-linear-gradient"
import { UserShow } from "../../user_show"
import api from "../../../api"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import { useToast } from "../../../contexts/Toast"
import { userReciveDataProps } from "@/components/user_show/user_show-types"
import MomentContext from "@/components/moment/context"
import { TextStyle } from "react-native"
import { ViewStyle } from "react-native"
import { Button, Host } from "@expo/ui/swift-ui"

export default function Input({
    preview = false,
    placeholder,
    color = String(ColorTheme().text),
    backgroundColor = String(ColorTheme().backgroundDisabled + 50),
    autoFocus = false,
}: CommentsInputProps) {
    const { t } = React.useContext(LanguageContext)
    const { actions, data } = React.useContext(MomentContext)
    const { focusedMoment, setCommentEnabled, commentEnabled } = React.useContext(FeedContext)
    const { session } = React.useContext(PersistedContext)
    const [commentText, setCommentText] = React.useState<string>("")
    const isDarkMode = useColorScheme() === "dark"
    const toast = useToast()

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
        backgroundColor: backgroundColor ? backgroundColor : ColorTheme().blur_button_color,
        overflow: "hidden",
        paddingRight: sizes.inputs.paddingHorizontal,
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
    const iconContainer: ViewStyle = {
        width: 60,
        borderRadius: 40 / 2,
        height: 40,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const gradient_border: ViewStyle = {
        alignSelf: "center",
        padding: 1,
        borderRadius: sizes.inputs.height / 2,
    }

    async function sendComment() {
        if (commentText)
            toast.success(t("Comment Has been sended with success"), {
                title: t("Comment Sended"),
                icon: <CheckIcon fill={colors.green.green_05.toString()} width={15} height={15} />,
            })
        setCommentEnabled(false)
        actions
            .registerInteraction("COMMENT", {
                momentId: data.id,
                authorizationToken: session.account.jwtToken,
                content: commentText,
            })
            .then(() => {
                toast.success(t("Comment Has been sended with success"), {
                    title: t("Comment Sended"),
                    icon: (
                        <CheckIcon fill={colors.green.green_05.toString()} width={15} height={15} />
                    ),
                })
            })
            .finally(() => {
                setCommentText("")
                setCommentEnabled(false)
            })
    }

    if (commentEnabled === false) return null

    if (preview)
        return (
            <LinearGradient
                colors={[String(colors.gray.grey_06), String(colors.gray.black)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={gradient_border}
            >
                <View style={input_container}>
                    <View style={[textContainer, { justifyContent: "center" }]}>
                        <Text style={[text, { opacity: 0.4, flex: 0 }]}>
                            {placeholder ? placeholder : t("Send Comment") + "..."}
                        </Text>
                    </View>
                    <Pressable onPress={handleButtonPress} style={pressable_style}>
                        <Animated.View
                            style={[
                                iconContainer,
                                { transform: [{ scale: animatedScale }] },
                                {
                                    backgroundColor:
                                        commentText == ""
                                            ? String(colors.transparent.white_10)
                                            : String(colors.transparent.white_20),
                                },
                            ]}
                        >
                            <Arrowbottom
                                fill={
                                    commentText == ""
                                        ? String(colors.transparent.white_60)
                                        : String(colors.gray.white)
                                }
                                width={16}
                                height={16}
                            />
                        </Animated.View>
                    </Pressable>
                </View>
            </LinearGradient>
        )
    return (
        <LinearGradient
            colors={[String(colors.gray.grey_06), String(colors.gray.grey_06)]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={gradient_border}
        >
            <View style={[input_container]}>
                <View style={textContainer}>
                    <TextInput
                        style={[text, { color, paddingRight: 12 }]}
                        placeholder={placeholder}
                        placeholderTextColor={String(
                            isDarkMode ? colors.gray.grey_05 : colors.transparent.black_50,
                        )}
                        selectionColor={colors.purple.purple_04}
                        numberOfLines={1}
                        onChangeText={(text) => setCommentText(text)}
                        autoFocus={autoFocus}
                    />
                </View>
                <Host matchContents>
                    <Button
                        color={colors.purple.purple_05}
                        disabled={!commentText}
                        systemImage="paperplane.fill"
                        variant="glassProminent"
                        controlSize="regular"
                    />
                </Host>
            </View>
        </LinearGradient>
    )
}
