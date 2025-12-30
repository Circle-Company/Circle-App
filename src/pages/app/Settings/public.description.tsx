import Icon from "@/assets/icons/svgs/check_circle.svg"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Keyboard, useColorScheme, ViewStyle } from "react-native"
import { Text, View } from "../../../components/Themed"
import ButtonStandart from "../../../components/buttons/button-standart"
import ColorTheme, { colors } from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"
import api from "../../../services/Api"
import Input from "@/components/general/input"
import { TextStyle } from "react-native"
import { textLib } from "@/shared/circle.text.library"

export default function DescriptionScreen() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const isDarkMode = useColorScheme() === "dark"
    const maxLength = 300

    const [keyboardIsVisible, setKeyboardIsVisible] = React.useState(false)
    const [description, setDescription] = React.useState(
        session.user.description ? session.user.description : "",
    )
    const height = keyboardIsVisible ? sizes.headers.height : sizes.headers.height
    const input_width = sizes.screens.width
    const navigation = useNavigation()

    const descriptionCanBeEdited = React.useMemo(() => {
        return (
            description !== session.user.description &&
            description.length <= maxLength &&
            description.length > 0
        )
    }, [description, session.user.description])

    const container: ViewStyle = {
        alignItems: "center",
        flex: 1,
    }

    const input_container: ViewStyle = {
        width: input_width,
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["1md"] * 0.7,
        alignItems: "flex-start",
        alignSelf: "center",
        justifyContent: "flex-start",
    }

    const input_style: TextStyle = {
        top: 2,
        fontFamily: fonts.family.Medium,
        width: input_width - sizes.paddings["1md"] * 0.7 * 2,
        borderRadius: sizes.borderRadius["1md"],
        paddingVertical: sizes.paddings["2sm"],
        paddingHorizontal: sizes.paddings["1md"],
        minHeight: sizes.screens.height * 0.1,
        maxHeight: sizes.screens.height * 0.4,
    }
    const bottom_style: ViewStyle = {
        width: sizes.screens.width,
        marginTop: sizes.margins["1sm"],
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1md"],
    }

    const counter: TextStyle = {
        fontSize: fonts.size.caption1,
        color: maxLength == description.length ? ColorTheme().error : ColorTheme().textDisabled,
    }

    const legend_style: TextStyle = {
        alignSelf: "center",
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        flex: 1,
    }

    const button_text: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family["Black-Italic"],
        color: descriptionCanBeEdited ? colors.gray.black : colors.gray.grey_04 + "90",
    }

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardIsVisible(true)
        })
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardIsVisible(false)
        })
        return () => {
            keyboardDidShowListener.remove()
            keyboardDidHideListener.remove()
        }
    }, [])

    const handleInputChange = (text: string) => {
        const formattedText = text.replace(/[_@#]/g, "")
        setDescription(formattedText)
    }

    async function handlePress() {
        if (descriptionCanBeEdited) {
            try {
                await api
                    .put(
                        "/account/description",
                        {
                            description: textLib.rich.formatToEnriched(description),
                        },
                        { headers: { Authorization: session.account.jwtToken } },
                    )
                    .finally(() => {
                        session.user.set({
                            ...session.user,
                            description,
                            richDescription: textLib.rich.formatToEnriched(description),
                        })
                        setDescription("")
                        navigation.goBack()
                    })
            } catch (err: any) {
                console.log(err.message)
            }
        }
    }

    return (
        <View style={container}>
            <View style={{ paddingBottom: sizes.paddings["2md"] }}>
                <View style={input_container}>
                    <Input
                        value={description}
                        textAlignVertical="top"
                        multiline={true}
                        returnKeyType="done"
                        keyboardType="twitter"
                        onChangeText={handleInputChange}
                        maxLength={300}
                        autoFocus={true}
                        numberOfLines={5}
                        style={input_style}
                        placeholder={t("say something about you") + "..."}
                        placeholderTextColor={String(ColorTheme().textDisabled)}
                    />
                </View>
                <View style={bottom_style}>
                    <Text style={legend_style}>
                        *{t("The description will be visible for all users to see")}
                    </Text>
                    <Text style={counter}>
                        {description.length}/{maxLength}
                    </Text>
                </View>
            </View>

            <ButtonStandart
                margins={false}
                height={40}
                action={handlePress}
                style={{ minWidth: sizes.buttons.width * 0.3 }}
                backgroundColor={
                    descriptionCanBeEdited
                        ? colors.gray.white
                        : ColorTheme().backgroundDisabled.toString()
                }
            >
                <Text style={button_text}>{t("Update")}</Text>
            </ButtonStandart>
        </View>
    )
}
