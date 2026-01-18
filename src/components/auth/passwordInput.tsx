import CheckIcon from "@/assets/icons/svgs/check_circle.svg"
import XIcon from "@/assets/icons/svgs/close.svg"
import Eye from "@/assets/icons/svgs/eye.svg"
import EyeSlash from "@/assets/icons/svgs/eye_slash.svg"
import Icon from "@/assets/icons/svgs/lock.svg"
import { Text, View } from "@/components/Themed"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import AuthContext from "@/contexts/auth"
import React, { useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Animated, Easing, Pressable, TextInput, useColorScheme } from "react-native"

type PasswordInputProps = {
    type: "signIn" | "signUp"
    onPasswordValidated?: (valid: boolean) => void
}

export default function PasswordInput({ type, onPasswordValidated }: PasswordInputProps) {
    const isDarkMode = useColorScheme() === "dark"
    const { t } = useTranslation()
    const { setSignInputPassword, signInputUsername, errorMessage, loading } =
        useContext(AuthContext)

    const [password, setPassword] = useState("")
    const [isValidPassword, setIsValidPassword] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [showStatusMessage, setShowStatusMessage] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [focused, setFocused] = useState(false)

    const inputRef = useRef<TextInput>(null)
    const inputWidth = sizes.screens.width - sizes.paddings["1lg"] * 2

    // 🎯 Animated values
    const scaleAnim = useRef(new Animated.Value(1)).current
    const shadowOpacity = useRef(new Animated.Value(0)).current
    const fadeIcons = useRef(new Animated.Value(0)).current
    const statusFade = useRef(new Animated.Value(0)).current
    const statusTranslate = useRef(new Animated.Value(4)).current
    const charCounterFade = useRef(new Animated.Value(0)).current
    const lockBounce = useRef(new Animated.Value(1)).current

    const handleFocus = () => {
        setFocused(true)
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
        setFocused(false)
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

    useEffect(() => {
        Animated.timing(fadeIcons, {
            toValue: password.length > 0 ? 1 : 0,
            duration: 1000,
            easing: Easing.out(Easing.poly(6)),
            useNativeDriver: true,
        }).start()

        Animated.timing(charCounterFade, {
            toValue: password.length > 0 ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start()
    }, [password])

    const validatePassword = (value: string) => {
        let valid = false
        if (value.length < 6) {
            setIsValidPassword(false)
            setStatusMessage("The password needs at least 6 characters.")
        } else if (value === signInputUsername) {
            setIsValidPassword(false)
            setStatusMessage("Password cannot be the same as username.")
        } else {
            valid = true
            setIsValidPassword(true)
            setStatusMessage("This password can be used.")
        }
        valid = value.length > 0
        setIsValidPassword(valid)
        setSignInputPassword(password)
        setStatusMessage(valid ? "" : "")

        // Feedback para status
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

        // Feedback visual no cadeado
        if (valid) {
            Animated.sequence([
                Animated.timing(lockBounce, {
                    toValue: 1.1,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(lockBounce, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }

    const handleInputChange = (text: string) => {
        setPassword(text)
        if (type === "signUp") validatePassword(text)

        setSignInputPassword(text)
        setShowStatusMessage(true)
    }

    const handleClearPressed = () => {
        setPassword("")
        setSignInputPassword("")
        setIsValidPassword(false)
        setShowStatusMessage(false)
    }

    const handleVisiblePressed = () => {
        setIsVisible((prev) => !prev)
    }

    useEffect(() => {
        onPasswordValidated?.(isValidPassword)
    }, [isValidPassword])

    const styles: any = {
        container: {
            width: sizes.screens.width,
            alignItems: "center",
            backgroundColor: "transparent",
            maxWidth: sizes.screens.width * 0.8,
        },
        inputContainer: {
            width: inputWidth,
            height: sizes.headers.height * 0.7,
            backgroundColor: colors.gray.grey_08,
            borderRadius: sizes.headers.height / 2,
            paddingHorizontal: sizes.paddings["1md"],
            flexDirection: "row",
            maxWidth: sizes.screens.width * 0.8,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 10,
            borderWidth: password.length > 0 ? 2 : 0,
            borderColor: colors.gray.grey_07,
        },
        input: {
            marginLeft: 10,
            fontFamily: fonts.family.Semibold,
            flex: 1,
            color: ColorTheme().text,
        },
        bottomContainer: {
            marginTop: sizes.margins["2sm"],
            width: sizes.screens.width,
            alignItems: "flex-start",
            paddingHorizontal: sizes.paddings["1xl"] * 1.1,
            backgroundColor: "#00000000",
        },
        charCounterContainer: {
            alignItems: "center",
            alignSelf: "center",
            borderRadius: sizes.sizes["1md"],
            paddingHorizontal: sizes.paddings["1sm"],
            paddingVertical: sizes.paddings["1sm"] * 0.3,
            backgroundColor: colors.gray.grey_07 + 80,
        },
        charCounter: {
            fontSize: fonts.size.caption2,
            fontFamily: fonts.family.Medium,
            color: ColorTheme().textDisabled,
        },
        legendContainer: {
            alignItems: "center",
            alignSelf: "center",
            flex: 1,
            backgroundColor: "#00000000",
        },
        legend: {
            marginTop: sizes.margins["2sm"],
            fontSize: fonts.size.caption2,
            fontFamily: fonts.family.Semibold,
            textAlign: "center",
            color: ColorTheme().textDisabled,
            alignSelf: "center",
            backgroundColor: "#00000000",
        },
        statusContainer: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
        },
        status: {
            fontSize: fonts.size.caption2,
            fontFamily: fonts.family.Semibold,
            color: isValidPassword ? ColorTheme().success : ColorTheme().textDisabled,
        },
        closeButtonContainer: {
            width: 20,
            height: 20,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: ColorTheme().backgroundDisabled,
            borderWidth: password.length > 0 ? 1 : 0,
            borderColor: ColorTheme().backgroundAccent + 10,
        },
        visibleButtonContainer: {
            right: -5,
            width: 30,
            height: 30,
            marginRight: sizes.margins["3sm"],
            alignItems: "center",
            justifyContent: "center",
        },
    }

    return (
        <View style={styles.container} testID="password-container">
            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                        shadowOpacity: shadowOpacity,
                    },
                ]}
            >
                <Animated.View style={{ transform: [{ scale: lockBounce }] }}>
                    <Icon
                        fill={
                            password.length > 0
                                ? ColorTheme().text.toString()
                                : ColorTheme().textDisabled + 80
                        }
                        width={password.length > 0 ? 16 : 14}
                        height={password.length > 0 ? 16 : 14}
                    />
                </Animated.View>

                <TextInput
                    testID="password-input"
                    value={password}
                    ref={inputRef}
                    secureTextEntry={!isVisible}
                    returnKeyType="done"
                    keyboardType="default"
                    autoCapitalize="none"
                    textContentType="password"
                    autoCorrect={false}
                    onChangeText={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    numberOfLines={1}
                    maxLength={20}
                    style={styles.input}
                    selectionColor={ColorTheme().primary}
                    placeholder={t("Password")}
                    placeholderTextColor={String(ColorTheme().textDisabled + "99")}
                />

                <Animated.View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        opacity: fadeIcons,
                    }}
                >
                    {!!password && (
                        <>
                            <Pressable
                                testID="password-toggle-visibility"
                                onPress={handleVisiblePressed}
                                style={[
                                    styles.visibleButtonContainer,
                                    { marginRight: focused ? 10 : 0 },
                                ]}
                            >
                                {!isVisible ? (
                                    <Eye fill={colors.gray.grey_04} width={14} height={14} />
                                ) : (
                                    <EyeSlash fill={colors.gray.grey_04} width={14} height={14} />
                                )}
                            </Pressable>
                            {focused && (
                                <Pressable
                                    testID="password-toggle-clear"
                                    onPress={handleClearPressed}
                                    style={styles.closeButtonContainer}
                                >
                                    <XIcon
                                        fill={colors.gray.grey_03}
                                        width={sizes.icons["1sm"].width * 0.7}
                                        height={sizes.icons["1sm"].height * 0.7}
                                    />
                                </Pressable>
                            )}
                        </>
                    )}
                </Animated.View>
            </Animated.View>

            <Animated.View style={styles.bottomContainer}>
                {type === "signUp" && showStatusMessage && statusMessage !== "" && (
                    <Animated.View
                        style={[
                            styles.statusContainer,
                            {
                                opacity: statusFade,
                                transform: [{ translateY: statusTranslate }],
                            },
                        ]}
                    >
                        {isValidPassword && (
                            <CheckIcon
                                style={{ marginRight: 6 }}
                                fill={colors.green.green_05}
                                width={14}
                                height={14}
                            />
                        )}
                        <Text style={styles.status}>{statusMessage}</Text>
                    </Animated.View>
                )}

                {type === "signUp" && password.length > 0 && (
                    <Animated.View
                        style={[styles.charCounterContainer, { opacity: charCounterFade }]}
                    >
                        <Text style={styles.charCounter}>{password.length} - 20</Text>
                    </Animated.View>
                )}

                {type === "signUp" && !errorMessage && !loading && (
                    <Text style={styles.legend}>
                        {password.length >= 4
                            ? t("Use numbers and special characters for stronger passwords.")
                            : t("Password must to be at least 4 characters long")}
                    </Text>
                )}
            </Animated.View>
        </View>
    )
}
