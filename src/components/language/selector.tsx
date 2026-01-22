import ArrowThic from "@/assets/icons/svgs/arrow-thic-down.svg"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import React from "react"
import { FlatList, Pressable, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Text } from "../Themed"

export function LanguageSelector() {
    const { changeAppLanguage, atualAppLanguage, languagesList } = React.useContext(LanguageContext)
    const [showLanguageModal, setShowLanguageModal] = React.useState(false)

    React.useEffect(() => {
        setShowLanguageModal(false)
    }, [])

    const container: ViewStyle = {
        width: sizes.screens.width,
        height: sizes.headers.height / 2,
        alignItems: "center",
        justifyContent: "center",
    }

    const atualLanguageContainer: ViewStyle = {
        flexDirection: "row",
        alignSelf: "center",
        alignItems: "center",
        gap: sizes.margins["1sm"],
        opacity: showLanguageModal ? 0.2 : 1,
    }
    const title: TextStyle = {
        alignSelf: "center",
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.body * 0.9,
        color: colors.gray.white,
    }

    const selectorContainer: ViewStyle = {
        top: 30,
        zIndex: 100,
        position: "absolute",
        borderRadius: sizes.borderRadius["1sm"] + 4,
        overflow: "hidden",
        elevation: 10,
        backgroundColor: ColorTheme().backgroundDisabled,
        padding: 4,
    }

    const languageContainer: ViewStyle = {
        paddingVertical: sizes.paddings["1sm"] * 0.5,
        paddingHorizontal: sizes.paddings["1md"],
        borderRadius: sizes.borderRadius["1sm"],
        overflow: "hidden",
    }
    const languageText: TextStyle = {
        alignSelf: "center",
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.body * 0.9,
        letterSpacing: -0.4,
    }

    return (
        <View style={container}>
            <Pressable
                onPress={() => setShowLanguageModal(!showLanguageModal)}
                style={atualLanguageContainer}
            >
                <Text style={title}>{atualAppLanguage.nativeName}</Text>
                <ArrowThic
                    style={{
                        top: 1,
                        transform: [{ rotate: showLanguageModal ? "180deg" : "0deg" }],
                    }}
                    fill={ColorTheme().text}
                    width={sizes.icons["1sm"].width * 0.6}
                    height={sizes.icons["1sm"].height * 0.6}
                />
            </Pressable>
            {showLanguageModal && (
                <FlatList
                    style={selectorContainer}
                    data={languagesList}
                    keyExtractor={(item) => item.code} // supondo que cada idioma tenha um 'code' único
                    horizontal={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                changeAppLanguage(item.code)
                                setShowLanguageModal(false)
                            }}
                            style={[
                                languageContainer,
                                {
                                    backgroundColor:
                                        item.code === atualAppLanguage.code
                                            ? ColorTheme().backgroundAccent
                                            : "#00000000",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    languageText,
                                    {
                                        color:
                                            item.code === atualAppLanguage.code
                                                ? ColorTheme().textAccent
                                                : ColorTheme().text,
                                        fontFamily:
                                            item.code === atualAppLanguage.code
                                                ? fonts.family.Bold
                                                : fonts.family.Medium,
                                    },
                                ]}
                            >
                                {item.nativeName}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    )
}
