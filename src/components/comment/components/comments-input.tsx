import React from "react"
import { Animated, Keyboard, Pressable, Text, TextInput, View, useColorScheme } from "react-native"
import { useNotifications } from "react-native-notificated"
import CheckIcon from "../../../assets/icons/svgs/check_circle.svg"
import Arrowbottom from "../../../assets/icons/svgs/paper_plane.svg"
import FeedContext from "../../../contexts/Feed"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import api from "../../../services/Api"
import { UserShow } from "../../user_show"
import { CommentsInputProps } from "../comments-types"

export default function input({
    preview = false,
    placeholder,
    color = String(ColorTheme().text),
    backgroundColor = String(ColorTheme().blur_button_color),
    autoFocus = false,
}: CommentsInputProps) {
    const { t } = React.useContext(LanguageContext)
    const { focusedMoment } = React.useContext(FeedContext)
    const { session } = React.useContext(PersistedContext)
    const [commentText, setCommentText] = React.useState<string>("")
    const isDarkMode = useColorScheme() === "dark"
    const { notify } = useNotifications()

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
        width: "100%",
        height: sizes.inputs.height,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: sizes.inputs.height / 2,
        paddingLeft: sizes.inputs.paddingHorizontal,
        backgroundColor: backgroundColor ? backgroundColor : ColorTheme().blur_button_color,
        overflow: "hidden",
        paddingRight: 9,
    }
    const text: any = {
        flex: 1,
        fontFamily: fonts.family.Medium,
        fontSize: 14,
        color: colors.gray.white,
    }
    const placeholderStyle: any = {
        flex: 1,
        fontFamily: fonts.family.Medium,
        fontSize: 14,
        color: colors.gray.white,
    }
    const textContainer: any = {
        marginLeft: 5,
        height: sizes.inputs.height,
        justifyContent: "center",
        flex: 1,
    }
    const pressable_style: any = {
        width: 40,
        height: 40,
    }
    const iconContainer: any = {
        width: 40,
        borderRadius: 40 / 2,
        height: 40,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    async function sendComment() {
        if (commentText)
            await api
                .post(
                    `/moments/${focusedMoment.id}/comments/create`,
                    {
                        content: commentText,
                    },
                    { headers: { Authorization: session.account.jwtToken } }
                )
                .then(() => {
                    notify("toast", {
                        params: {
                            description: t("Comment Has been sended with success"),
                            title: t("Comment Sended"),
                            icon: (
                                <CheckIcon
                                    fill={colors.green.green_05.toString()}
                                    width={15}
                                    height={15}
                                />
                            ),
                        },
                    })
                })
    }

    if (preview)
        return (
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
        )
    return (
        <View style={[input_container, { paddingLeft: sizes.paddings["1sm"] * 0.2 }]}>
            <UserShow.Root data={session.user}>
                <UserShow.ProfilePicture
                    disableAnalytics={true}
                    displayOnMoment={false}
                    pictureDimensions={{ width: 40, height: 40 }}
                />
            </UserShow.Root>
            <View style={textContainer}>
                <TextInput
                    style={[text, { color }]}
                    placeholder={placeholder}
                    placeholderTextColor={String(
                        isDarkMode ? colors.gray.grey_05 : colors.transparent.black_50
                    )}
                    numberOfLines={1}
                    onChangeText={(text) => setCommentText(text)}
                    autoFocus={autoFocus}
                />
            </View>
            <Pressable
                onPress={(n) => {
                    handleButtonPress()
                }}
                style={pressable_style}
            >
                <Animated.View
                    style={[
                        iconContainer,
                        { transform: [{ scale: animatedScale }] },
                        {
                            backgroundColor:
                                commentText == ""
                                    ? isDarkMode
                                        ? colors.transparent.white_10
                                        : colors.transparent.black_20
                                    : String(colors.blue.blue_05),
                        },
                    ]}
                >
                    <Arrowbottom
                        fill={String(
                            !commentText
                                ? isDarkMode
                                    ? colors.gray.grey_05
                                    : colors.gray.white
                                : colors.gray.white
                        )}
                        width={16}
                        height={16}
                    />
                </Animated.View>
            </Pressable>
        </View>
    )
}
