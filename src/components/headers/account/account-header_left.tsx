import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import Icon from "../../../assets/icons/svgs/tray.svg"
import ColorTheme from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import ButtonStandart from "../../buttons/button-standart"

export default function AccountHeaderLeft() {
    const navigation = useNavigation()

    const container: any = {
        flexDirection: "row",
        marginLeft: sizes.margins["3sm"],
    }
    function handlePress() {
        navigation.navigate("InboxNavigator", { screen: "Inbox" })
    }

    return (
        <View style={container}>
            <ButtonStandart
                action={handlePress}
                margins={false}
                backgroundColor={String(ColorTheme().backgroundDisabled)}
            >
                <Icon fill={String(ColorTheme().text)} width={18} height={18} />
            </ButtonStandart>
        </View>
    )
}
