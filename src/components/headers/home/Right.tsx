import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Text, TextStyle, View, ViewStyle } from "react-native"

import { BadgeIcon } from "@/components/general/badge-icon"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import Camera from "../../../assets/icons/svgs/camera.svg"
import Bell from "../../../assets/icons/svgs/tray.svg"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import ButtonStandart from "../../buttons/button-standart"

export default function HeaderRightHome() {
    const { t } = React.useContext(LanguageContext)
    const {session} = React.useContext(PersistedContext)

    const navigation: NavigationProp<any> = useNavigation()

    const container: ViewStyle = {
        flexDirection: "row",
        marginRight: sizes.margins["3sm"],
    }

    const text: TextStyle = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text,
    }
    const textContainer: ViewStyle = {
        marginRight: sizes.margins["1sm"],
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

    async function onPressNotifications() {
        navigation.navigate("InboxNavigator", { screen: "Inbox" })
    }

    return (
        <View style={container}>
            <View style={buttonContainer}>
                <ButtonStandart
                    style={{paddingHorizontal: sizes.paddings["2sm"]}}
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
                square={true}
                action={onPressNotifications}
                margins={false}
                backgroundColor={String(ColorTheme().backgroundDisabled)}
            ><Bell fill={String(ColorTheme().text)} width={16} height={16} />
                <BadgeIcon number={session.account.unreadNotificationsCount} style={{top: -7, right: -10}}/> 
                
            </ButtonStandart>
            
        </View>
    )
}
