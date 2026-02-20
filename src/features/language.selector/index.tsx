import React from "react"
import { FlatList, Pressable, View, useColorScheme } from "react-native"
import CheckIcon from "@/assets/icons/svgs/check_circle.svg"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import PersistedContext from "@/contexts/Persisted"
import LanguageContext from "@/contexts/language"
import { Text, TextStyle, ViewStyle } from "@/components/Themed"
import { LanguagesCodesType } from "@/locales/LanguageTypes"

export default function ListLanguagesSelector() {
    const { changeAppLanguage, languagesList } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)

    function handlePress(value: LanguagesCodesType) {
        changeAppLanguage(value)
    }

    const isDarkMode = useColorScheme() === "dark"
    const icon_fill: string = ColorTheme().primary

    const container: ViewStyle = {
        width: "100%",
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
        top
        fontSize: fonts.size.title3 * 0.8,
        fontFamily: fonts.family.Semibold,
    }

    const getContainerStyle = (code: LanguagesCodesType): ViewStyle => ({
        ...container,
        borderWidth: session.preferences.language.appLanguage === code ? 2 : 0,
        borderColor:
            session.preferences.language.appLanguage === code
                ? ColorTheme().primary
                : "transparent",
    })

    return (
        <FlatList
            data={languagesList}
            showsVerticalScrollIndicator={false}
            style={{ width: "100%" }}
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
