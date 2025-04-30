import UserIcon from "@/assets/icons/svgs/@.svg"
import { Text } from "@/components/Themed"
import React from "react"
import { Keyboard, Pressable, TextInput, View, useColorScheme } from "react-native"
import CloseIcon from "../../../../assets/icons/svgs/close.svg"
import SearchIcon from "../../../../assets/icons/svgs/search.svg"
import LanguageContext from "../../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"
import { useSearchContext } from "../../search-context"

export default function input() {
    const { searchTerm, setSearchTerm, fetchData } = useSearchContext()
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const [showCancel, setShowCancel] = React.useState(Keyboard.isVisible())

    const handleInputChange = (text: string) => {
        // Substitui espaços por ponto
        const replacedSpaces = text.replace(/\s+/g, ".")
        // Permite somente letras, números, ponto (.) e underline (_)
        const filtered = replacedSpaces.replace(/[^a-zA-Z0-9._]/g, "")
        // Remove ocorrências consecutivas de ponto ou underline, substituindo-as por uma única ocorrência
        const noConsecutive = filtered.replace(/([._])\1+/g, "$1")
        setSearchTerm(noConsecutive.toLowerCase())
    }

    const handleClosePress = () => {
        setSearchTerm("")
    }

    const handleCancelPress = () => {
        Keyboard.dismiss()
        setShowCancel(false)
    }

    React.useEffect(() => {
        setShowCancel(Keyboard.isVisible())
    }, [Keyboard.isVisible()])

    React.useEffect(() => {
        setShowCancel(true)
        const fetchDataFromApi = async () => {
            try {
                await fetchData(searchTerm)
            } catch (error) {
                console.error("Erro ao buscar dados da API:", error)
            }
        }
        fetchDataFromApi()
    }, [searchTerm])

    React.useEffect(() => {
        setShowCancel(false)
        setSearchTerm("")
    }, [])

    const out_container: any = {
        width: sizes.screens.width,
        height: sizes.headers.height,
        paddingHorizontal: sizes.paddings["2sm"],
        alignItems: "center",
        justifyContent: "center",
    }

    const container: any = {
        borderRadius: sizes.inputs.height / 2,
        height: sizes.buttons.height / 1.8,
        overflow: "hidden",
        backgroundColor: ColorTheme().backgroundDisabled,
    }
    const input_container: any = {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: sizes.inputs.height / 2,
        paddingLeft: sizes.inputs.paddingHorizontal,
        backgroundColor: ColorTheme().backgroundDisabled,
        paddingRight: 9,
    }
    const text: any = {
        flex: 1,
        fontFamily: fonts.family.Medium,
        fontSize: 14,
        color: ColorTheme().text,
    }
    const textContainer: any = {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: sizes.margins["2sm"],
        height: sizes.inputs.height,
        justifyContent: "center",
        flex: 1,
    }
    const iconContainer: any = {
        width: 20,
        height: 20,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }
    const iconContainer2: any = {
        marginLeft: sizes.margins["1sm"],
        width: 22,
        height: 22,
        borderRadius: 20,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_06 : colors.gray.grey_03,
    }
    const cancelButtonContainer: any = {
        height: 22,
        borderRadius: 20,
        marginRight: sizes.margins["1sm"],
        paddingHorizontal: sizes.paddings["1sm"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_06 : colors.gray.grey_03,
    }
    const cancelText: any = {
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text + 90,
    }
    return (
        <View style={out_container}>
            <View style={container}>
                <View style={input_container}>
                    <View style={iconContainer}>
                        <SearchIcon
                            fill={searchTerm ? ColorTheme().text : ColorTheme().textDisabled}
                            width={searchTerm ? 16 : 15}
                            height={searchTerm ? 16 : 15}
                        />
                    </View>
                    <View style={textContainer}>
                        <UserIcon
                            style={{ right: -2 }}
                            fill={searchTerm ? ColorTheme().text : ColorTheme().textDisabled}
                            width={14}
                            height={14}
                        />
                        <TextInput
                            style={text}
                            placeholder={t("username...")}
                            maxLength={35}
                            placeholderTextColor={String(colors.gray.grey_04)}
                            numberOfLines={1}
                            value={searchTerm}
                            onChangeText={handleInputChange}
                            autoCapitalize="none"
                            autoFocus={false}
                        />
                    </View>
                    {showCancel && (
                        <Pressable style={cancelButtonContainer} onPress={handleCancelPress}>
                            <Text style={cancelText}>Cancel</Text>
                        </Pressable>
                    )}
                    {searchTerm && (
                        <Pressable style={iconContainer2} onPress={handleClosePress}>
                            <CloseIcon
                                fill={String(
                                    isDarkMode ? colors.gray.grey_03 : colors.gray.grey_04
                                )}
                                width={11}
                                height={11}
                            />
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    )
}
