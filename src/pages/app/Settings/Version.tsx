import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { Text, View } from "../../../components/Themed"
import config from "../../../config"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function VersionScreen() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        alignItems: "center",
        flex: 1,
    }

    const description_container = {
        paddingHorizontal: sizes.paddings["1md"] * 0.6,
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

    const item_container = {
        paddingHorizontal: sizes.paddings["2md"],
        marginBottom: sizes.margins["2sm"],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    }

    const text = {
        fontFamily: fonts.family.Regular,
        color: ColorTheme().text,
    }

    const title = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().text,
    }

    const data = [
        {
            title: config.APPLICATION_NAME + ` (${t("Release")})`,
            version: config.APP_VERSION,
        },
    ]

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={description_container}>
                <Text style={description_style}>
                    *
                    {t(
                        "Keeping the API version up to date and carefully managing changes and updates is critical to ensuring the stability, security, and continued functionality of the application over time."
                    )}{" "}
                </Text>
            </View>

            <View style={description_container}>
                <Text style={[description_style, { top: -10 }]}>
                    *
                    {t(
                        "Beta version, performance and features currently present do not represent the final release version."
                    )}
                </Text>
            </View>
            {data.map((item, index) => {
                return (
                    <View key={index} style={item_container}>
                        <Text style={[title, { flex: 1 }]}>{item.title}</Text>
                        <Text style={text}>{item.version}</Text>
                    </View>
                )
            })}
        </View>
    )
}
