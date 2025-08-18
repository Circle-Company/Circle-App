import { View, ViewStyle } from "react-native"

import Icon from "@/assets/icons/svgs/bell_fill.svg"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import ColorTheme from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import PersistedContext from "../../../contexts/Persisted"
import ButtonStandart from "../../buttons/button-standart"
import { BadgeIcon } from "../../general/badge-icon"

export default function AccountHeaderLeft() {
    const { session } = React.useContext(PersistedContext)
    const navigation = useNavigation()

    const container: ViewStyle = {
        flexDirection: "row",
        marginLeft: sizes.margins["3sm"],
    }

    function handlePress() {
        navigation.navigate("InboxNavigator", { screen: "Inbox" })
    }

    return (
        <View style={container}>
            <ButtonStandart
                square
                action={handlePress}
                margins={false}
                backgroundColor={String(ColorTheme().backgroundDisabled)}
            >
                <Icon fill={String(ColorTheme().text)} width={16} height={16} />
            </ButtonStandart>
            <BadgeIcon number={session.account.unreadNotificationsCount} />
        </View>
    )
}
