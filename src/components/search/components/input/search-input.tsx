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

    const handleInputChange = (text: string) => {
        setSearchTerm(text.toLowerCase())
    }
    const handleCancelPress = () => {
        setSearchTerm("")
        Keyboard.dismiss() // Fecha o teclado
    }

    React.useEffect(() => {
        const fetchDataFromApi = async () => {
            try {
                const data = await fetchData(searchTerm)
                console.log("Dados da API:", data)
            } catch (error) {
                console.error("Erro ao buscar dados da API:", error)
            }
        }
        fetchDataFromApi()
    }, [searchTerm])

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
        marginLeft: 5,
        height: sizes.inputs.height,
        justifyContent: "center",
        flex: 1,
    }
    const pressable_style: any = {
        width: 40,
        height: 40,
    }
    const iconContainer: any = {
        width: 20,
        height: 20,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }
    const iconContainer2: any = {
        width: 22,
        height: 22,
        borderRadius: 20,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_06 : colors.gray.grey_03,
    }
    return (
        <View style={out_container}>
            <View style={container}>
                <View style={input_container}>
                    <View style={iconContainer}>
                        <SearchIcon fill={String(colors.gray.grey_04)} width={16} height={16} />
                    </View>
                    <View style={textContainer}>
                        <TextInput
                            style={text}
                            placeholder={t("Type @username")}
                            maxLength={35}
                            placeholderTextColor={String(colors.gray.grey_04)}
                            numberOfLines={1}
                            value={searchTerm}
                            onChangeText={handleInputChange}
                            autoCapitalize="none"
                            autoFocus={true}
                        />
                    </View>
                    {searchTerm && (
                        <Pressable style={iconContainer2} onPress={handleCancelPress}>
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
