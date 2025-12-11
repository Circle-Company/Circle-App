import Icon from "@/assets/icons/svgs/@2.svg" // Ícone representando "@" ou similar
import CheckIcon from "@/assets/icons/svgs/check_circle.svg"
import XIcon from "@/assets/icons/svgs/close.svg"
import { Text } from "@/components/Themed"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import NewMomentContext from "@/contexts/newMoment"
import React, { useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
    Animated,
    Easing,
    Pressable,
    TextInput,
    TextStyle,
    useColorScheme,
    View,
    ViewStyle,
} from "react-native"

export default function DescriptionInput() {
    const isDarkMode = useColorScheme() === "dark"
    const { setDescription, description } = useContext(NewMomentContext)
    const { t } = useTranslation()
    const [isDescriptionAvailable, setIsDescriptionAvailable] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [showStatusMessage, setShowStatusMessage] = useState(false)
    const [usernameIsValid, setDescriptionIsValid] = useState(false)

    const inputRef = useRef<TextInput>(null)
    const inputWidth = sizes.screens.width - sizes.paddings["1lg"] * 2

    // 🎯 Animated values
    const scaleAnim = useRef(new Animated.Value(1)).current
    const shadowOpacity = useRef(new Animated.Value(0)).current
    const fadeIcons = useRef(new Animated.Value(0)).current
    const statusFade = useRef(new Animated.Value(0)).current
    const statusTranslate = useRef(new Animated.Value(4)).current
    const charCounterFade = useRef(new Animated.Value(0)).current
    const iconBounce = useRef(new Animated.Value(1)).current

    // Handlers para foco
    const handleFocus = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1.03,
                duration: 200,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }),
            Animated.timing(shadowOpacity, {
                toValue: 0.2,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start()
    }

    const handleBlur = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }),
            Animated.timing(shadowOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start()
    }

    // Atualiza animações conforme o valor do Description
    useEffect(() => {
        Animated.timing(fadeIcons, {
            toValue: description.length > 0 ? 1 : 0,
            duration: 1000,
            easing: Easing.out(Easing.poly(6)),
            useNativeDriver: true,
        }).start()

        Animated.timing(charCounterFade, {
            toValue: description.length > 0 ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start()
    }, [description])

    // --- Handlers dos inputs --- //
    const handleInputChange = (text: string) => {
        setDescription(text)
    }

    const handleClearPressed = () => {
        setDescription("")
        setIsDescriptionAvailable(false)
        setDescriptionIsValid(false)
        setStatusMessage(t("The Description needs at least 4 characters."))
    }

    // Animações para o status
    useEffect(() => {
        Animated.parallel([
            Animated.timing(statusFade, {
                toValue: showStatusMessage && statusMessage ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(statusTranslate, {
                toValue: showStatusMessage && statusMessage ? 0 : 4,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start()
    }, [showStatusMessage, statusMessage])

    const container: ViewStyle = {
        width: sizes.screens.width,
        alignItems: "center",
        backgroundColor: "transparent",
    }
    const inputContainer: ViewStyle = {
        width: inputWidth,
        height: sizes.headers.height * 0.7,
        backgroundColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02 + "80",
        borderRadius: sizes.headers.height / 2,
        paddingHorizontal: sizes.paddings["1md"],
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        borderWidth: description.length > 0 ? 2 : 0,
        borderColor: ColorTheme().backgroundDisabled,
    }
    const input: TextStyle = {
        marginLeft: 10,
        fontFamily: fonts.family.Semibold,
        flex: 1,
        color: ColorTheme().text,
    }
    const bottomContainer: ViewStyle = {
        marginTop: sizes.margins["1md"],
        width: sizes.screens.width,
        alignItems: "flex-start",
        paddingHorizontal: sizes.paddings["1xl"] * 1.1,
        backgroundColor: "#00000000",
    }
    const charCounterContainer: ViewStyle = {
        borderRadius: sizes.sizes["1md"],
        paddingHorizontal: sizes.paddings["1sm"],
        paddingVertical: sizes.paddings["1sm"] * 0.3,
        backgroundColor: ColorTheme().backgroundDisabled + "80",
    }
    const charCounter: TextStyle = {
        fontSize: fonts.size.caption2,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }
    const legendContainer: ViewStyle = {
        alignItems: "center",
        alignSelf: "center",
        flex: 1,
        backgroundColor: "#00000000",
    }
    const legend: TextStyle = {
        fontSize: fonts.size.caption2,
        fontFamily: fonts.family.Semibold,
        textAlign: "center",
        color: ColorTheme().textDisabled,
        alignSelf: "center",
        backgroundColor: "#00000000",
    }
    const statusContainer: ViewStyle = {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    }
    const status: TextStyle = {
        fontSize: fonts.size.caption2,
        fontFamily: fonts.family.Semibold,
        color: usernameIsValid
            ? isDescriptionAvailable
                ? ColorTheme().success
                : ColorTheme().error
            : ColorTheme().textDisabled,
    }
    const closeButtonContainer: ViewStyle = {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ColorTheme().backgroundDisabled,
        borderWidth: description.length > 0 ? 1 : 0,
        borderColor: ColorTheme().backgroundAccent + 10,
    }

    return (
        <View style={container} testID="Description-container">
            <Animated.View
                style={[
                    inputContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                        shadowOpacity: shadowOpacity,
                    },
                ]}
            >
                <Animated.View style={{ transform: [{ scale: iconBounce }] }}></Animated.View>
                <TextInput
                    testID="Description-input"
                    value={description}
                    ref={inputRef}
                    textAlignVertical="center"
                    multiline={false}
                    returnKeyType="done"
                    keyboardType="default"
                    autoCapitalize="sentences"
                    textContentType="none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoCorrect={false}
                    onChangeText={handleInputChange}
                    numberOfLines={1}
                    maxLength={20}
                    style={input}
                    autoFocus={true}
                    selectionColor={ColorTheme().primary}
                    placeholder={t("Description") + "..."}
                    placeholderTextColor={String(ColorTheme().textDisabled + "99")}
                />
                <Animated.View style={{ flexDirection: "row", opacity: fadeIcons }}>
                    {description && (
                        <Pressable
                            onPress={handleClearPressed}
                            style={closeButtonContainer}
                            testID="Description-toggle-clear"
                        >
                            <XIcon
                                fill={colors.gray.grey_01.toString()}
                                width={sizes.icons["1sm"].width * 0.7}
                                height={sizes.icons["1sm"].height * 0.7}
                            />
                        </Pressable>
                    )}
                </Animated.View>
            </Animated.View>
            <View style={legendContainer}>
                <Text style={legend}>
                    {t(
                        "The Description can only contain lowercase letters, numbers and '_' and '.'",
                    )}
                </Text>
            </View>
            {description.length > 0 && isDescriptionAvailable && (
                <View style={charCounterContainer}>
                    <Text style={charCounter}>{description.length} - 20</Text>
                </View>
            )}
        </View>
    )
}
