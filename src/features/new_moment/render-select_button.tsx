import React from "react"
import { View, Text, useColorScheme } from "react-native"
import { colors } from "../../layout/constants/colors"
import { useNavigation } from "@react-navigation/native"
import sizes from "../../layout/constants/sizes"
import fonts from "../../layout/constants/fonts"
import NewMomentContext from "../../contexts/newMoment"
import ButtonStandart from "../../components/buttons/button-standart"
import AddIcon from "../../assets/icons/svgs/camera.svg"
import LanguageContext from "../../contexts/Preferences/language"

export default function RenderSelectButton() {
    const { selectedImage, handleLaunchImageLibrary } = React.useContext(NewMomentContext)
    const { t } = React.useContext(LanguageContext)
    const [active, setActive] = React.useState(true)
    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === "dark"

    React.useEffect(() => {
        if (selectedImage) setActive(false)
        else setActive(true)
    }, [selectedImage])

    const container: any = {
        flexDirection: "row",
    }

    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: active ? colors.gray.white : isDarkMode ? colors.gray.white : colors.gray.black,
    }
    const textContainer = {
        marginRight: sizes.margins["2sm"],
    }

    async function onHandlePress() {
        await handleLaunchImageLibrary()
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
        </View>
    )
}
