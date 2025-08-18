import React from "react"
import { Linking, Pressable, StatusBar, useColorScheme } from "react-native"
import { Text, View } from "../../../components/Themed"
import config from "../../../config"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import LanguageContext from "../../../contexts/Preferences/language"

export default function SupportScreen() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        alignItems: "center",
        flex: 1,
    }

    const description_container = {
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
    }

    const description_style = {
        lineHeight: 12,
        marginBottom: sizes.margins["2sm"],
        fontSize: fonts.size.body * 0.8,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        textAlign: "justify",
    }

    const link_style = {
        textDecorationLine: "underline",
        fontFamily: fonts.family["Semibold-Italic"],
        color: ColorTheme().primary,
    }

    const textData = [
        t(
            "If you have any questions or want to report something more serious, send an email to our support.",
        ),
        t("If you have found a bug, please help us by reporting it. Thanks!"),
    ]

    const handlePress = () => {
        Linking.openURL(config.SUPPORT_URL)
    }

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={description_container}>
                {textData.map((text, index) => {
                    return (
                        <Text key={index} style={description_style}>
                            * {text}
                        </Text>
                    )
                })}
            </View>
            <Pressable onPress={handlePress}>
                <Text style={link_style}>suporte@circlecompany.com.br</Text>
            </Pressable>
        </View>
    )
}
