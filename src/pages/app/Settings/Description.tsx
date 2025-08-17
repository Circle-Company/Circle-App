import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Keyboard, StatusBar, TextInput, useColorScheme } from "react-native"
import Icon from "../../../assets/icons/svgs/check_circle.svg"
import { Text, View } from "../../../components/Themed"
import ButtonStandart from "../../../components/buttons/button-standart"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import api from "../../../services/Api"

export default function DescriptionScreen() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const isDarkMode = useColorScheme() === "dark"
    const maxLength = 300

    const [keyboardIsVisible, setKeyboardIsVisible] = React.useState(false)
    const [description, setDescription] = React.useState(
        session.user.description ? session.user.description : ""
    )
    const height = keyboardIsVisible ? sizes.headers.height : sizes.headers.height
    const input_width = sizes.screens.width
    const navigation = useNavigation()

    const container = {
        alignItems: "center",
        flex: 1,
    }

    const input_container = {
        width: input_width,
        borderBottomWidth: sizes.borders["1md"],
        borderColor: ColorTheme().backgroundDisabled,
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["1md"] * 0.7,
        alignItems: "flex-start",
        alignSelf: "center",
        justifyContent: "flex-start",
    }

    const input_style = {
        top: 2,
        alignSelf: "flex-start",
        fontFamily: fonts.family.Semibold,
        width: input_width - sizes.paddings["1md"] * 0.7 * 2,
    }
    const bottom_style = {
        width: sizes.screens.width,
        height: sizes.headers.height * 0.8,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderBottomWidth: sizes.borders["1md"],
        borderColor: ColorTheme().backgroundDisabled,
        paddingHorizontal: sizes.paddings["1md"] * 0.7,
    }

    const counter = {
        fontSize: fonts.size.caption1,
        color: maxLength == description.length ? ColorTheme().error : ColorTheme().textDisabled,
    }

    const legend_style = {
        alignSelf: "center",
        fontSize: fonts.size.caption2,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        flex: 1,
    }

    const button_text = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: description
            ? colors.gray.white
            : isDarkMode
              ? colors.gray.grey_04 + "90"
              : colors.gray.grey_04 + "90",
    }

    const icon = {
        marginLeft: sizes.margins["2sm"],
        top: 0.4,
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
        if (description) {
            try {
                await api
                    .put(
                        "/account/edit/description",
                        {
                            user_id: session.user.id,
                            description,
                        },
                        { headers: { Authorization: session.account.jwtToken } }
                    )
                    .finally(() => {
                        session.user.get(session.user.id)
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
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={{ paddingBottom: sizes.paddings["2md"] }}>
                <View style={input_container}>
                    <TextInput
                        value={description}
                        textAlignVertical="top"
                        multiline={true}
                        returnKeyType="done"
                        keyboardType="twitter"
                        onChangeText={handleInputChange}
                        maxLength={300}
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
                width={sizes.buttons.width / 3.5}
                height={40}
                action={handlePress}
                backgroundColor={
                    description
                        ? ColorTheme().primary.toString()
                        : ColorTheme().backgroundDisabled.toString()
                }
            >
                <Text style={button_text}>{t("Done")}</Text>
                <Icon
                    style={icon}
                    fill={String(
                        description
                            ? colors.gray.white
                            : isDarkMode
                              ? colors.gray.grey_04 + "90"
                              : colors.gray.grey_04 + "90"
                    )}
                    width={17}
                    height={17}
                />
            </ButtonStandart>
        </View>
    )
}
