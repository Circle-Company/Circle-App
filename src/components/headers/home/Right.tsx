import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Text, TextStyle, View, ViewStyle, Platform } from "react-native"

import { BadgeIcon } from "../../general/badge-icon"
import Bell from "@/assets/icons/svgs/tray.svg"
import ButtonStandart from "../../buttons/button-standart"
import Camera from "@/assets/icons/svgs/camera.svg"
import ColorTheme from "../../../constants/colors"
import LanguageContext from "../../../contexts/Preferences/language"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"

export default function HeaderRightHome() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)

    const navigation: NavigationProp<any> = useNavigation()

    const container: ViewStyle = {
        flexDirection: "row",
        marginRight: sizes.margins["1sm"],
    }

    const text: TextStyle = {
        fontSize: fonts.size.footnote,
        fontFamily:
            Platform.OS === "ios" ? fonts.family["Variable-Italic"] : fonts.family["Bold-Italic"],
        fontWeight: Platform.OS === "ios" ? "700" : undefined,
        color: ColorTheme().text,
    }
    const textContainer: ViewStyle = {
        marginRight: sizes.margins["2sm"],
    }
    const buttonContainer: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginRight: sizes.margins["2sm"],
    }

    async function onPressNewMoment() {
        navigation.navigate("CreateBottomTab")
    }

    return (
        <View style={container}>
            <View style={buttonContainer}>
                <ButtonStandart
                    style={{ paddingHorizontal: sizes.paddings["2sm"] }}
                    action={onPressNewMoment}
                    margins={false}
                    backgroundColor={String(ColorTheme().backgroundDisabled)}
                >
                    <View style={textContainer}>
                        <Text style={text}>{t("Create")}</Text>
                    </View>
                    <Camera fill={String(ColorTheme().text)} width={16} height={16} />
                </ButtonStandart>
            </View>
        </View>
    )
}
