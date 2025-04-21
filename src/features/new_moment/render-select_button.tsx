import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Text, TextStyle, useColorScheme, View, ViewStyle } from "react-native"
import AddIcon from "../../assets/icons/svgs/camera.svg"
import ButtonStandart from "../../components/buttons/button-standart"
import LanguageContext from "../../contexts/Preferences/language"
import NewMomentContext from "../../contexts/newMoment"
import { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"

// Definição de tipos para o navegador
type RootStackParamList = {
    CameraScreen: undefined
}

export default function RenderSelectButton() {
    const { selectedImage, handleLaunchImageLibrary } = React.useContext(NewMomentContext)
    const { t } = React.useContext(LanguageContext)
    const [active, setActive] = React.useState(true)
    const navigation = useNavigation<any>() // Usar any temporariamente
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
    const textContainer: ViewStyle = {
        marginRight: sizes.margins["2sm"],
    }

    async function onHandlePress() {
        await handleLaunchImageLibrary()
    }

    function onOpenCamera() {
        navigation.navigate("CameraScreen")
    }

    return (
        <View style={container}>
            <ButtonStandart
                action={onHandlePress}
                width={sizes.buttons.width * 0.4}
                margins={true}
                backgroundColor={String(
                    active
                        ? colors.blue.blue_05
                        : isDarkMode
                          ? colors.gray.grey_07
                          : colors.gray.grey_02
                )}
            >
                <View style={textContainer}>
                    <Text style={text}>{t("Select Other")}</Text>
                </View>
                <AddIcon
                    fill={String(
                        active
                            ? colors.gray.white
                            : isDarkMode
                              ? colors.gray.white
                              : colors.gray.black
                    )}
                    width={14}
                    height={14}
                />
            </ButtonStandart>

            <ButtonStandart
                action={onOpenCamera}
                width={sizes.buttons.width * 0.4}
                margins={false}
                backgroundColor={String(colors.blue.blue_05)}
            >
                <View style={textContainer}>
                    <Text style={[text, { color: colors.gray.white } as TextStyle]}>
                        {t("Camera")}
                    </Text>
                </View>
                <AddIcon fill={String(colors.gray.white)} width={14} height={14} />
            </ButtonStandart>
        </View>
    )
}
