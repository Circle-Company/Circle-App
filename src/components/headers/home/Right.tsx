import { Text, View } from "react-native"

import { BadgeIcon } from "@/components/general/badge-icon"
import Bell from "../../../assets/icons/svgs/tray.svg"
import ButtonStandart from "../../buttons/button-standart"
import Camera from "../../../assets/icons/svgs/camera.svg"
import ColorTheme from "../../../layout/constants/colors"
import LanguageContext from "../../../contexts/Preferences/language"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { useNavigation } from "@react-navigation/native"

export default function HeaderRightHome() {
    const { t } = React.useContext(LanguageContext)
    const {session} = React.useContext(PersistedContext)

    const navigation: any = useNavigation()

    const container: any = {
        flexDirection: "row",
        marginRight: sizes.margins["3sm"],
    }

    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text,
    }
    const textContainer = {
        marginRight: sizes.margins["1sm"],
    }
    const buttonContainer = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginRight: sizes.margins["2sm"],
    }

    async function onPressNewMoment() {
        navigation.navigate("CreateBottomTab")
    }

    async function onPressNotifications() {
        navigation.navigate("InboxNavigator", { screen: "Inbox" })
    }

    return (
        <View style={container}>
            <View style={buttonContainer}>
                <ButtonStandart
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
            <ButtonStandart
                style={{paddingHorizontal: sizes.paddings["1sm"]}}
                square={false}
                action={onPressNotifications}
                margins={false}
                backgroundColor={String(ColorTheme().backgroundDisabled)}
            >
                <BadgeIcon style={{position: "relative", marginRight: 6, borderWidth: 0}}number={1} /> 
                <Bell fill={String(ColorTheme().text)} width={16} height={16} />
            </ButtonStandart>
            
        </View>
    )
}
