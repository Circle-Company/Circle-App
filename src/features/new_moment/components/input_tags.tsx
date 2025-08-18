import { ColorValue, Text, TextInput, TextStyle, ViewStyle, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../constants/colors"

import React from "react"
import { View } from "../../../components/Themed"
import ButtonStandart from "../../../components/buttons/button-standart"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import LanguageContext from "../../../contexts/Preferences/language"
import NewMomentContext from "../../../contexts/newMoment"

type RenderMomentProps = {
    height?: number
    keyboardIsVisible: boolean
}

export default function TagsInput({
    keyboardIsVisible = false,
    height = keyboardIsVisible ? sizes.headers.height : sizes.headers.height,
}: RenderMomentProps) {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const input_width = sizes.screens.width / 1 - sizes.paddings["1lg"] * 2
    const { tags, addTag } = React.useContext(NewMomentContext)
    const [tag, setTag] = React.useState<string>("")

    const container = {
        width: sizes.screens.width,
        marginVertical: keyboardIsVisible ? sizes.margins["1sm"] : sizes.margins["2sm"],
    }

    const input_container: ViewStyle = {
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

    const text_style: TextStyle = {
        marginLeft: input_width / 7,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().text,
    }

    const input_style: TextStyle = {
        top: 2,
        alignSelf: "flex-start",
        fontFamily: fonts.family.Semibold,
        width: input_width - sizes.paddings["1md"] * 0.7 * 2 - input_width / 6 - 20,
        height: height - sizes.paddings["1sm"] * 2,
    }

    const button_background: ColorValue = tag ? ColorTheme().primary : ColorTheme().background
    const button_text_style: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: tag ? colors.gray.white : isDarkMode ? colors.gray.white : colors.gray.black,
    }

    const hash_style: TextStyle = {
        width: 20,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().text,
    }

    const legend_style: TextStyle = {
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
                <ButtonStandart action={handelButtonPress} backgroundColor={button_background}>
                    <Text style={button_text_style}>{t("Add")}</Text>
                </ButtonStandart>
            </View>

            <Text style={legend_style}>
                {t("*Type one tag at a time and press 'Add' to add it")}
            </Text>
        </View>
    )
}
