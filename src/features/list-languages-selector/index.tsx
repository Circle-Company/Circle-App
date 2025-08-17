import { FlatList, Pressable, View, useColorScheme } from "react-native"
import { Text, TextStyle, ViewStyle } from "../../components/Themed"
import ColorTheme, { colors } from "../../layout/constants/colors"

import React from "react"
import CheckIcon from "../../assets/icons/svgs/check_circle.svg"
import PersistedContext from "../../contexts/Persisted"
import LanguageContext from "../../contexts/Preferences/language"
import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"
import { LanguagesCodesType } from "../../locales/LanguageTypes"

export default function ListLanguagesSelector() {
    const { changeAppLanguage, languagesList, t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)

    function handlePress(value: LanguagesCodesType) {
        changeAppLanguage(value)
    }

    const isDarkMode = useColorScheme() === "dark"
    const icon_fill: string = isDarkMode ? String(colors.blue.blue_05) : String(colors.blue.blue_05)

    const header_container: ViewStyle = {
        height: sizes.sizes["2md"],
        width: sizes.screens.width - sizes.paddings["1sm"],
        marginHorizontal: sizes.paddings["1sm"] * 0.5,
        paddingHorizontal: sizes.paddings["2sm"],
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderRadius: sizes.borderRadius["1sm"],
        marginBottom: sizes.paddings["1sm"],
    }
    const header_text: TextStyle = {
        fontSize: fonts.size.caption1 * 1.05,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().primary,
    }

    const container: ViewStyle = {
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        paddingVertical: sizes.paddings["1md"],
        paddingLeft: sizes.paddings["1sm"],
        paddingRight: sizes.paddings["1sm"],
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderRadius: sizes.borderRadius["1md"],
        marginBottom: sizes.paddings["1sm"],
    }
    const container_left: ViewStyle = {
        paddingLeft: sizes.paddings["1sm"],
        alignItems: "flex-start",
        flex: 1,
    }
    const container_right: ViewStyle = {
        paddingLeft: 2,
        alignItems: "center",
        width: sizes.screens.width / 8,
    }

    const text_style: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
    }

    const getContainerStyle = (code: LanguagesCodesType): ViewStyle => ({
        ...container,
        borderWidth: session.preferences.language.appLanguage === code ? 2 : 0,
        borderColor:
            session.preferences.language.appLanguage === code ? colors.blue.blue_05 : "transparent",
    })

    return (
        <FlatList
            data={languagesList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
                return (
                    <Pressable
                        style={getContainerStyle(item.code)}
                        onPress={() => {
                            handlePress(item.code)
                        }}
                    >
                        <View style={container_left}>
                            <Text style={text_style}>{item.nativeName}</Text>
                        </View>
                        {session.preferences.language.appLanguage == item.code && (
                            <View style={container_right}>
                                <CheckIcon fill={icon_fill} width={22} height={22} />
                            </View>
                        )}
                    </Pressable>
                )
            }}
        />
    )
}
