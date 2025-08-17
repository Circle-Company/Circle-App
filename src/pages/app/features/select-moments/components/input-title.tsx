import React from "react"
import { Text, TextInput } from "react-native"
import { View } from "../../../../../components/Themed"
import ColorTheme from "../../../../../constants/colors"
import fonts from "../../../../../constants/fonts"
import sizes from "../../../../../constants/sizes"
import LanguageContext from "../../../../../contexts/Preferences/language"
import SelectMomentsContext from "../../../../../contexts/selectMoments"
type RenderMomentProps = {}

export default function TitleInput({}: RenderMomentProps) {
    const { t } = React.useContext(LanguageContext)
    const { setTitle, title } = React.useContext(SelectMomentsContext)

    const container = {
        width: 258,
    }

    const input_container = {
        width: 258,
        height: sizes.headers.height,
        backgroundColor: ColorTheme().backgroundDisabled,
        borderRadius: 258 / 2,
        marginTop: sizes.margins["2sm"],
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["1md"] * 0.7,
        alignItems: "flex-start",
        justifyContent: "center",
    }

    const text_style: any = {
        marginLeft: sizes.margins["3sm"],
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().text,
    }

    const input_style: any = {
        top: 2,
        fontFamily: fonts.family.Semibold,
        width: 258 - sizes.paddings["1md"] * 0.7 * 2,
        height: sizes.headers.height - sizes.paddings["1sm"] * 2,
    }

    const handleInputChange = (text: string) => {
        setTitle(text)
    }

    return (
        <View style={container}>
            <Text style={text_style}>{t("Title")} ✏️</Text>

            <View style={input_container}>
                <TextInput
                    value={title}
                    onChangeText={handleInputChange}
                    numberOfLines={1}
                    maxLength={30}
                    style={input_style}
                    placeholder={t("New Memory")}
                    placeholderTextColor={String(ColorTheme().textDisabled)}
                />
            </View>
        </View>
    )
}
