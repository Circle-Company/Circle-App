import {
    Animated,
    Easing,
    Keyboard,
    TextInput,
    TextStyle,
    ViewStyle,
    useColorScheme,
} from "react-native"
import { Text, View } from "../../../../../components/Themed"
import ColorTheme, { colors } from "../../../../../constants/colors"

import React from "react"
import ButtonStandart from "../../../../../components/buttons/button-standart"
import fonts from "../../../../../constants/fonts"
import sizes from "../../../../../constants/sizes"
import LanguageContext from "../../../../../contexts/Preferences/language"
import MemoryContext from "../../../../../contexts/memory"
import EditMemoryContext from "../edit_memory_context"

export default function TitleMemory() {
    const { t } = React.useContext(LanguageContext)
    const { editTitle, setTitle, title } = React.useContext(EditMemoryContext)
    const { memory } = React.useContext(MemoryContext)
    const isDarkMode = useColorScheme() === "dark"
    const maxLength = 30
    const [keyboardIsVisible, setKeyboardIsVisible] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const inputWidth = sizes.screens.width
    const animation = React.useRef(new Animated.Value(-sizes.headers.height * 0.8)).current

    const styles = {
        inputContainer: {
            zIndex: 2,
            width: inputWidth - sizes.paddings["1sm"] * 2,
            borderRadius: sizes.borderRadius["1md"],
            backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
            paddingVertical: sizes.paddings["1sm"],
            paddingHorizontal: sizes.paddings["1md"] * 0.7,
            flexDirection: "row" as const,
            alignItems: "center" as const,
            alignSelf: "center" as const,
            justifyContent: "flex-start" as const,
        } as ViewStyle,
        inputStyle: {
            top: 2,
            alignSelf: "flex-start" as const,
            fontFamily: fonts.family.Semibold,
            flex: 1,
            marginRight: sizes.margins["2sm"],
            color: ColorTheme().text,
        } as TextStyle,
        bottomStyle: {
            zIndex: 1,
            width: sizes.screens.width,
            height: sizes.headers.height * 0.8,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            flexDirection: "row" as const,
            paddingHorizontal: sizes.paddings["1md"] * 0.7,
            transform: [{ translateY: animation }],
            opacity: isFocused ? 1 : 0,
        } as ViewStyle,
        counter: {
            fontSize: fonts.size.caption1,
            color: maxLength === title.length ? ColorTheme().error : ColorTheme().textDisabled,
        } as TextStyle,
        legendStyle: {
            fontSize: fonts.size.caption2,
            fontFamily: fonts.family.Medium,
            color: ColorTheme().textDisabled,
            flex: 1,
        } as TextStyle,
        buttonText: {
            fontSize: fonts.size.body * 0.8,
            fontFamily: fonts.family.Semibold,
            color: String(
                title !== memory.title && title
                    ? colors.gray.white
                    : isDarkMode
                    ? colors.gray.grey_06
                    : colors.gray.grey_04 + "80",
            ),
        } as TextStyle,
        titleStyle: {
            fontSize: fonts.size.body * 0.9,
            fontFamily: fonts.family.Semibold,
            color: ColorTheme().textDisabled + "90",
            marginRight: sizes.margins["2sm"],
        } as TextStyle,
    }

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardIsVisible(true)
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start()
        })

        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardIsVisible(false)
            Animated.timing(animation, {
                toValue: -sizes.headers.height * 0.8,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start()
        })

        return () => {
            keyboardDidShowListener.remove()
            keyboardDidHideListener.remove()
        }
    }, [animation])

    const handleInputChange = (text: string) => {
        const formattedText = text.replace(/[_@#]/g, "")
        setTitle(formattedText)
    }

    const handlePress = async () => {
        if (title !== memory.title && title) {
            await editTitle()
        }
    }

    return (
        <>
            <View style={styles.inputContainer}>
                <Text style={styles.titleStyle}>{t("Title")}:</Text>
                <TextInput
                    value={title.toString()}
                    textAlignVertical="top"
                    multiline={false}
                    returnKeyType="done"
                    keyboardType="twitter"
                    onChangeText={handleInputChange}
                    maxLength={maxLength}
                    style={styles.inputStyle}
                    placeholder={`${t("memory title")}...`}
                    placeholderTextColor={String(ColorTheme().textDisabled)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {keyboardIsVisible && (
                    <ButtonStandart
                        margins={false}
                        action={handlePress}
                        backgroundColor={String(
                            title !== memory.title && title
                                ? colors.blue.blue_05
                                : isDarkMode
                                ? colors.gray.grey_08
                                : colors.gray.grey_02,
                        )}
                    >
                        <Text style={styles.buttonText}>{t("Confirm")}</Text>
                    </ButtonStandart>
                )}
            </View>

            <Animated.View style={styles.bottomStyle}>
                <Text style={[styles.legendStyle, { opacity: isFocused ? 1 : 0 }]}>
                    *{t("Memory title will be visible for all users to see")}
                </Text>
                <Text style={[styles.counter, { opacity: isFocused ? 1 : 0 }]}>
                    {title.length}/{maxLength}
                </Text>
            </Animated.View>
        </>
    )
}
