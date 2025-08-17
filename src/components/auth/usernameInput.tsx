import { usernameRegex } from "@/lib/hooks/useUsernameRegex"
import React, { useContext, useEffect, useRef, useState } from "react"
import { Animated, Easing, Pressable, TextInput, useColorScheme } from "react-native"
import Icon from "../../assets/icons/svgs/@.svg" // Ícone representando "@" ou similar
import CheckIcon from "../../assets/icons/svgs/check_circle.svg"
import XIcon from "../../assets/icons/svgs/close.svg"
import AuthContext from "../../contexts/Auth"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"
import api from "../../services/Api" // Serviço para verificar disponibilidade do username
import { Text, View } from "../Themed"

type UsernameInputProps = {
    type: "signIn" | "signUp"
}

export default function UsernameInput({ type }: UsernameInputProps) {
    const isDarkMode = useColorScheme() === "dark"
    const { setSignInputUsername } = useContext(AuthContext)

    const [username, setUsername] = useState("")
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [showStatusMessage, setShowStatusMessage] = useState(false)
    const [usernameIsValid, setUsernameIsValid] = useState(false)

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

    // Atualiza animações conforme o valor do username
    useEffect(() => {
        Animated.timing(fadeIcons, {
            toValue: username.length > 0 ? 1 : 0,
            duration: 1000,
            easing: Easing.out(Easing.poly(6)),
            useNativeDriver: true,
        }).start()

        Animated.timing(charCounterFade, {
            toValue: username.length > 0 ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start()
    }, [username])

    // --- Lógica de validação --- //
    const validateUsername = async (value: string): Promise<boolean> => {
        // Verifica formato usando regex
        const { valid, message } = usernameRegex(value)
        if (!valid) {
            setStatusMessage(message || "Invalid username.")
            setIsUsernameAvailable(false)
            setUsernameIsValid(false)
            setSignInputUsername("")
            return false
        }

        // Se formato válido, dispara verificação de disponibilidade
        setStatusMessage("Checking availability...")
        setIsUsernameAvailable(false)
        setUsernameIsValid(false)
        setSignInputUsername("")

        try {
            const response = await api.post("/auth/username-already-in-use", { username: value })
            // Atualiza os estados de acordo com a resposta
            setSignInputUsername(value)
            setUsernameIsValid(true)
            setIsUsernameAvailable(response.data.enable_to_use)
            setStatusMessage(response.data.message)
            return response.data.enable_to_use
        } catch {
            setStatusMessage("Error verifying username.")
            setIsUsernameAvailable(false)
            setUsernameIsValid(false)
            return false
        }
    }

    // --- Handlers dos inputs --- //
    const handleInputChange = (text: string) => {
        // Permite apenas letras minúsculas, números, "_" e "."
        const formattedText = text.replace(/[^a-z0-9_.]/g, "")
        setUsername(formattedText)

        if (type === "signUp") {
            validateUsername(formattedText)
        } else if (type === "signIn") {
            setSignInputUsername(formattedText)
        }
        // Mostra a mensagem de status mesmo se estiver em branco (para feedback visual)
        setShowStatusMessage(true)
    }

    const handleClearPressed = () => {
        setUsername("")
        setSignInputUsername("")
        setIsUsernameAvailable(false)
        setUsernameIsValid(false)
        setStatusMessage("The username needs at least 4 characters.")
        setShowStatusMessage(true)
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

    const styles: any = {
        container: { width: sizes.screens.width, alignItems: "center" },
        inputContainer: {
            width: inputWidth,
            height: sizes.headers.height,
            backgroundColor: isDarkMode ? colors.gray.grey_08 + "90" : colors.gray.grey_02 + "80",
            borderRadius: sizes.headers.height / 2,
            paddingHorizontal: sizes.paddings["1md"],
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 10,
        },
        input: {
            marginLeft: 10,
            fontFamily: fonts.family.Semibold,
            flex: 1,
            color: ColorTheme().text,
        },
        bottomContainer: {
            marginTop: sizes.margins["1sm"],
            width: sizes.screens.width,
            alignItems: "flex-start",
            paddingHorizontal: sizes.paddings["1xl"] * 1.1,
        },
        charCounterContainer: {
            borderRadius: sizes.sizes["1md"],
            paddingHorizontal: sizes.paddings["1sm"],
            paddingVertical: sizes.paddings["1sm"] * 0.3,
            backgroundColor: ColorTheme().backgroundDisabled + "80",
        },
        charCounter: {
            fontSize: fonts.size.caption2,
            fontFamily: fonts.family.Medium,
            color: ColorTheme().textDisabled,
        },
        legendContainer: {
            marginTop: sizes.margins["1md"],
        },
        legend: {
            marginTop: sizes.margins["1sm"],
            fontSize: fonts.size.caption2,
            fontFamily: fonts.family.Medium,
            color: ColorTheme().textDisabled,
        },
        statusContainer: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
        },
        status: {
            fontSize: fonts.size.caption1,
            fontFamily: fonts.family.Medium,
            color: usernameIsValid ? ColorTheme().success : ColorTheme().textDisabled,
        },
        closeButtonContainer: {
            width: 20,
            height: 20,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: ColorTheme().backgroundDisabled,
        },
    }

    return (
        <View style={styles.container} testID="username-container">
            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                        shadowOpacity: shadowOpacity,
                    },
                ]}
            >
                <Animated.View style={{ transform: [{ scale: iconBounce }] }}>
                    <Icon
                        fill={
                            username.length > 0
                                ? ColorTheme().text.toString()
                                : ColorTheme().textDisabled + 80
                        }
                        width={username.length > 0 ? 16 : 14}
                        height={username.length > 0 ? 16 : 14}
                    />
                </Animated.View>
                <TextInput
                    testID="username-input"
                    value={username}
                    ref={inputRef}
                    textAlignVertical="center"
                    multiline={false}
                    returnKeyType="done"
                    keyboardType="default"
                    autoCapitalize="none"
                    textContentType="username"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoCorrect={false}
                    onChangeText={handleInputChange}
                    numberOfLines={1}
                    maxLength={20}
                    style={styles.input}
                    selectionColor={ColorTheme().primary}
                    placeholder="Username"
                    placeholderTextColor={String(ColorTheme().textDisabled + "99")}
                />
                <Animated.View style={{ flexDirection: "row", opacity: fadeIcons }}>
                    {username && (
                        <Pressable
                            onPress={handleClearPressed}
                            style={styles.closeButtonContainer}
                            testID="username-toggle-clear"
                        >
                            <XIcon
                                fill={colors.gray.grey_04.toString()}
                                width={sizes.icons["1sm"].width * 0.7}
                                height={sizes.icons["1sm"].height * 0.7}
                            />
                        </Pressable>
                    )}
                </Animated.View>
            </Animated.View>
            {type === "signUp" && (
                <View style={styles.bottomContainer}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {showStatusMessage && (
                            <View style={styles.statusContainer}>
                                {usernameIsValid && (
                                    <CheckIcon
                                        style={{ marginRight: 6 }}
                                        fill={colors.green.green_05.toString()}
                                        width={sizes.icons["1sm"].width * 0.7}
                                        height={sizes.icons["1sm"].height * 0.7}
                                    />
                                )}
                                <Text style={styles.status}>{statusMessage}</Text>
                            </View>
                        )}
                        <View style={styles.charCounterContainer}>
                            <Text style={styles.charCounter}>{username.length} - 20</Text>
                        </View>
                    </View>

                    <View style={styles.legendContainer}>
                        <Text style={styles.legend}>
                            The username can only contain lowercase letters, numbers and "_" and "."
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}
