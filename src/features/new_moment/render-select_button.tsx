import { Text, TextStyle, View, ViewStyle, useColorScheme } from "react-native"

import React from "react"
import AddIcon from "../../assets/icons/svgs/camera.svg"
import ButtonStandart from "../../components/buttons/button-standart"
import { colors } from "../../constants/colors"
import fonts from "../../constants/fonts"
import sizes from "../../constants/sizes"
import LanguageContext from "../../contexts/Preferences/language"
import NewMomentContext from "../../contexts/newMoment"

interface RenderSelectButtonProps {
    onPress?: () => void
    buttonText?: string
}

export default function RenderSelectButton({ onPress, buttonText }: RenderSelectButtonProps) {
    const { selectedImage, handleLaunchImageLibrary } = React.useContext(NewMomentContext)
    const { t } = React.useContext(LanguageContext)
    const [active, setActive] = React.useState(true)
    const isDarkMode = useColorScheme() === "dark"

    React.useEffect(() => {
        if (selectedImage) setActive(false)
        else setActive(true)
    }, [selectedImage])

    const container: ViewStyle = {
        flexDirection: "row",
    }

    const text: TextStyle = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: active ? colors.gray.white : isDarkMode ? colors.gray.white : colors.gray.black,
    }
    const textContainer = {
        marginRight: sizes.margins["2sm"],
    }

    async function onHandlePress() {
        if (onPress) {
            onPress()
        } else {
            await handleLaunchImageLibrary()
        }
    }

    return (
        <View style={container}>
            <ButtonStandart
                action={onHandlePress}
                width={sizes.buttons.width * 0.5}
                margins={false}
                backgroundColor={String(
                    active
                        ? colors.blue.blue_05
                        : isDarkMode
                        ? colors.gray.grey_07
                        : colors.gray.grey_02,
                )}
            >
                <View style={textContainer}>
                    <Text style={text}>{buttonText || t("Select Other")}</Text>
                </View>
                <AddIcon
                    fill={String(
                        active
                            ? colors.gray.white
                            : isDarkMode
                            ? colors.gray.white
                            : colors.gray.black,
                    )}
                    width={14}
                    height={14}
                />
            </ButtonStandart>
        </View>
    )
}
