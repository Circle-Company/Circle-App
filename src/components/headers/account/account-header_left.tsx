import { BadgeIcon } from "@/components/general/badge-icon"
import PersistedContext from "@/contexts/Persisted"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View, ViewStyle } from "react-native"
import Icon from "../../../assets/icons/svgs/tray.svg"
import ColorTheme from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import ButtonStandart from "../../buttons/button-standart"

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
                <Icon fill={String(ColorTheme().text)} width={18} height={18} />
            </ButtonStandart>
            <BadgeIcon number={session.account.unreadNotificationsCount} />
        </View>
    )
}
