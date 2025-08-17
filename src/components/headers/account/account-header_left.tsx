import { View, ViewStyle } from "react-native"

import { BadgeIcon } from "@/components/general/badge-icon"
import ButtonStandart from "../../buttons/button-standart"
import ColorTheme from "../../../layout/constants/colors"
import Icon from "../../../assets/icons/svgs/bell_fill.svg"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import sizes from "../../../layout/constants/sizes"
import { useNavigation } from "@react-navigation/native"

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
