import React from "react"
import { View } from "../../../components/Themed"
import { Text, TextInput, useColorScheme } from "react-native"
import sizes from "../../../layout/constants/sizes"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import NewMomentContext from "../../../contexts/newMoment"
import ButtonStandart from "../../../components/buttons/button-standart"
import LanguageContext from "../../../contexts/Preferences/language"
type RenderMomentProps = {
    height?: number
    keyboardIsVisible: boolean
}

export default function TagsInput({
    keyboardIsVisible = false,
    height = keyboardIsVisible ? sizes.headers.height : sizes.headers.height,
}: RenderMomentProps) {
    const { t } = React.useContext(LanguageContext)
    const maxLength = 300
    const isDarkMode = useColorScheme() === "dark"
    const input_width = sizes.screens.width / 1 - sizes.paddings["1lg"] * 2
    const { tags, addTag } = React.useContext(NewMomentContext)
    const [tag, setTag] = React.useState<string>("")

    const container = {
        width: sizes.screens.width,
        marginVertical: keyboardIsVisible ? sizes.margins["1sm"] : sizes.margins["2sm"],
    }

    const input_container = {
        width: input_width,
        height,
        backgroundColor: ColorTheme().backgroundDisabled,
        borderRadius: sizes.headers.height / 2,
        marginTop: sizes.margins["2sm"],
        paddingVertical: sizes.paddings["1sm"],
        paddingLeft: sizes.paddings["1md"],
        paddingRight: sizes.paddings["1md"] * 0.7,
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
    }

    const text_style: any = {
        marginLeft: input_width / 7,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().text,
    }

    const input_style: any = {
        top: 2,
        alignSelf: "flex-start",
        fontFamily: fonts.family.Semibold,
        width: input_width - sizes.paddings["1md"] * 0.7 * 2 - input_width / 6 - 20,
        height: height - sizes.paddings["1sm"] * 2,
    }

    const button_background: any = tag ? ColorTheme().primary : ColorTheme().background
    const button_text_style: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: tag ? colors.gray.white : isDarkMode ? colors.gray.white : colors.gray.black,
    }

    const hash_style: any = {
        width: 20,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().text,
    }

    const legend_style: any = {
        marginTop: sizes.margins["1sm"],
        alignSelf: "center",
        fontSize: fonts.size.caption2,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }
    const handleInputChange = (text: string) => {
        const formattedText = text.replace(/[^a-zA-Z0-9çÇáéíóúÁÉÍÓÚâêîôÂÊÎÔãõÃÕ]/g, "")
        setTag(formattedText)
    }
    const handelButtonPress = () => {
        if (tag !== "") {
            addTag({ title: tag })
            setTag("")
        }
    }
    return (
        <View style={container}>
            <Text style={text_style}>{t("Tags")} 🚩</Text>

            <View style={input_container}>
                <Text style={hash_style}>#</Text>
                <TextInput
                    value={tag}
                    textAlignVertical="top"
                    multiline={false}
                    returnKeyType="done"
                    keyboardType="twitter"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    onChangeText={handleInputChange}
                    numberOfLines={5}
                    maxLength={27}
                    style={input_style}
                    placeholder={t("tag name")}
                    placeholderTextColor={String(ColorTheme().textDisabled)}
                />
                <ButtonStandart
                    action={handelButtonPress}
                    backgroundColor={button_background}
                    width={input_width / 6}
                >
                    <Text style={button_text_style}>{t("Add")}</Text>
                </ButtonStandart>
            </View>

            <Text style={legend_style}>
                {t("*Type one tag at a time and press 'Add' to add it")}
            </Text>
        </View>
    )
}
