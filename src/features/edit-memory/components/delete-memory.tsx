import { Animated, Easing, Keyboard, TextStyle, View, ViewStyle, useColorScheme } from "react-native"

import { useNavigation } from "@react-navigation/native"
import React from "react"
import Icon from "../../../assets/icons/svgs/trash.svg"
import ButtonStandart from "../../../components/buttons/button-standart"
import { Text } from "../../../components/Themed"
import LanguageContext from "../../../contexts/Preferences/language"
import { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import EditMemoryContext from "../edit_memory_context"

export default function DeleteMemory() {
    const isDarkMode = useColorScheme() === "dark"
    const { t } = React.useContext(LanguageContext)
    const { deleteMemory } = React.useContext(EditMemoryContext)
    const navigation = useNavigation()
    const animation = React.useRef(new Animated.Value(-sizes.headers.height * 0.8)).current

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start()
        })

        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
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

    const styles = {
        container: {
            marginTop: sizes.paddings["1sm"],
            width: sizes.screens.width - sizes.paddings["1sm"] * 2,
            marginHorizontal: sizes.paddings["1sm"],
            backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
            borderRadius: sizes.borderRadius["1md"],
            flexDirection: "row" as const,
            paddingHorizontal: sizes.paddings["1md"],
            paddingVertical: sizes.paddings["1md"],
            transform: [{ translateY: animation }],
        } as ViewStyle,
        descriptionContainer: {
            flex: 1,
            paddingRight: sizes.paddings["1md"],
        } as ViewStyle,
        buttonText: {
            fontSize: fonts.size.body * 0.8,
            fontFamily: fonts.family.Semibold,
            color: isDarkMode ? colors.red.red_01 : colors.gray.white,
        } as TextStyle,
        descriptionText: {
            fontSize: fonts.size.body * 0.7,
            fontFamily: fonts.family.Medium,
            color: isDarkMode ? colors.gray.grey_04 : colors.gray.grey_06,
            textAlign: "justify" as const,
        } as TextStyle,
        icon: {
            marginLeft: sizes.margins["2sm"],
            top: 0.4,
        } as ViewStyle,
    }

    const handlePress = async () => {
        await deleteMemory()
        navigation.goBack()
    }

    return (
        <Animated.View style={styles.container}>
            <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                    {t(
                        "Are you sure you want to permanently delete this Memory? You won't be able to recover this later."
                    )}
                </Text>
            </View>

            <View>
                <ButtonStandart
                    margins={false}
                    action={handlePress}
                    backgroundColor={isDarkMode ? colors.red.red_09 : colors.red.red_05}
                >
                    <Text style={styles.buttonText}>{t("Delete")}</Text>
                    <Icon 
                        style={styles.icon} 
                        fill={isDarkMode ? colors.red.red_01 : colors.gray.white} 
                        width={14} 
                        height={14} 
                    />
                </ButtonStandart>
            </View>
        </Animated.View>
    )
}
