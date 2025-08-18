import { Text, TextInput, TextStyle, ViewStyle } from "react-native"

import React from "react"
import { View } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import LanguageContext from "../../../contexts/Preferences/language"
import NewMomentContext from "../../../contexts/newMoment"

type RenderMomentProps = {
    height?: number
    keyboardIsVisible: boolean
}

export default function DescriptionInput({
    keyboardIsVisible = false,
    height = keyboardIsVisible ? sizes.headers.height : sizes.headers.height,
}: RenderMomentProps) {
    const { t } = React.useContext(LanguageContext)
    const maxLength = 300
    const input_width = sizes.screens.width - sizes.paddings["1lg"] * 2
    const { description, setDescription } = React.useContext(NewMomentContext)
    const container = {
        width: sizes.screens.width,
    }

    const input_container: ViewStyle = {
        width: input_width,
        backgroundColor: ColorTheme().backgroundDisabled,
        borderRadius: sizes.headers.height / 2,
        marginTop: sizes.margins["2sm"],
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["1md"] * 0.7,
        alignItems: "flex-start",
        alignSelf: "center",
        justifyContent: "flex-start",
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
        width: input_width - sizes.paddings["1md"] * 0.7 * 2,
        height: height - sizes.paddings["1sm"] * 2,
    }

    const counter: TextStyle = {
        fontSize: fonts.size.caption1,
        alignSelf: "flex-end",
        color: maxLength == description.length ? ColorTheme().error : ColorTheme().textDisabled,
    }

    const legend_style: TextStyle = {
        marginTop: sizes.margins["1sm"],
        alignSelf: "center",
        fontSize: fonts.size.caption2,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }

    const handleInputChange = (text: string) => {
        const formattedText = text.replace(/[_@#]/g, "")
        setDescription(formattedText)
    }

    return (
        <View style={container}>
            <Text style={text_style}>{t("Description")} ✏️</Text>

            <View style={input_container}>
                <TextInput
                    value={description}
                    textAlignVertical="top"
                    multiline={false}
                    returnKeyType="done"
                    keyboardType="twitter"
                    onChangeText={handleInputChange}
                    numberOfLines={5}
                    maxLength={300}
                    style={input_style}
                    placeholder={t("description") + "..."}
                    placeholderTextColor={String(ColorTheme().textDisabled)}
                />
                <Text style={counter}>
                    {description.length}/{maxLength}
                </Text>
            </View>
            <Text style={legend_style}>
                *{t("The description will be visible for all users to see")}
            </Text>
        </View>
    )
}
