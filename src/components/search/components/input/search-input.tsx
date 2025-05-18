import React, { useRef } from "react"
import { Animated, Easing, Pressable, TextInput, View, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../../layout/constants/colors"

import UserIcon from "@/assets/icons/svgs/@.svg"
import CloseIcon from "../../../../assets/icons/svgs/close.svg"
import SearchIcon from "../../../../assets/icons/svgs/search.svg"
import LanguageContext from "../../../../contexts/Preferences/language"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"
import { useSearchContext } from "../../search-context"

export default function SearchInput() {
    const { searchTerm, setSearchTerm, fetchData } = useSearchContext()
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"

    // Animações
    const bounceAnim = useRef(new Animated.Value(1)).current
    const containerScale = useRef(new Animated.Value(1)).current

    const animateBounce = () => {
        Animated.sequence([
            Animated.timing(bounceAnim, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
                easing: Easing.linear
            }),
            Animated.timing(bounceAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
                easing: Easing.bounce
            })
        ]).start()
    }

    const handleInputChange = (text: string) => {
        animateBounce()
        // Substitui espaços por ponto
        const replacedSpaces = text.replace(/\s+/g, ".")
        // Permite somente letras, números, ponto (.) e underline (_)
        const filtered = replacedSpaces.replace(/[^a-zA-Z0-9._]/g, "")
        // Remove ocorrências consecutivas de ponto ou underline, substituindo-as por uma única ocorrência
        const noConsecutive = filtered.replace(/([._])\1+/g, "$1")
        const newValue = noConsecutive.toLowerCase()
        setSearchTerm(newValue)

        // Anima a escala baseada no tamanho do texto
        Animated.timing(containerScale, {
            toValue: newValue.length > 0 ? 1.05 : 0.98,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1)
        }).start()
    }

    const handleClosePress = () => {
        setSearchTerm("")
    }

    React.useEffect(() => {
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
        width: sizes.screens.width - (sizes.paddings["2sm"] * 2),
        height: sizes.buttons.height / 1.8,
        borderRadius: sizes.inputs.height / 2,
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
        marginRight: sizes.margins["1sm"],
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
            <Animated.View 
                style={[
                    container,
                    {
                        transform: [{ scale: containerScale }]
                    }
                ]}
            >
                <View style={input_container}>
                    <Animated.View 
                        style={[
                            iconContainer,
                            {
                                transform: [{ scale: bounceAnim }]
                            }
                        ]}
                    >
                        <SearchIcon
                            fill={searchTerm ? ColorTheme().text : ColorTheme().textDisabled}
                            width={searchTerm ? 16 : 15}
                            height={searchTerm ? 16 : 15}
                        />
                    </Animated.View>
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
            </Animated.View>
        </View>
    )
}
