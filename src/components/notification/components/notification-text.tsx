import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import LanguageContext from "../../../contexts/Preferences/language"
import { timeDifferenceConverter } from "../../../helpers/dateConversor"
import { Text } from "../../Themed"
import { UserShow } from "../../user_show"
import { useIndividualNotificationContext } from "../notification-individual_context"

export default function NotificationText() {
    const { notification } = useIndividualNotificationContext()
    const { t } = React.useContext(LanguageContext)
    const [text, setText] = React.useState<string>("")

    const notificactionsText = {
        "LIKE-MOMENT": t("liked your moment"),
        "NEW-MEMORY": t("see what he is doing now") + "... ✨",
        "ADD-TO-MEMORY": t("see what he is doing now") + "... ✨",
        "FOLLOW-USER": t("is following you") + " 🎉",
        "VIEW-USER": t("viewed your profile"),
    }

    React.useEffect(() => {
        if (notification.type) setText(notificactionsText[notification.type])
    }, [notification])

    const containerStyle: any = {
        alignItems: "flex-start",
        justifyContent: "flex-start",
    }

    const textStyle: any = {
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.body * 1,
        lineHeight: 15,
    }

    const dataTextStyle: any = {
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().textDisabled,
        fontSize: fonts.size.body * 0.9,
        lineHeight: 17,
    }

    return (
        <View style={containerStyle}>
            <UserShow.Root data={notification.sender_user}>
                <UserShow.Username displayOnMoment={false} fontSize={fonts.size.body * 0.9} />
                <Text style={dataTextStyle}>
                    {" "}
                    {timeDifferenceConverter({ date: notification.created_at, small: true })}
                </Text>
            </UserShow.Root>
            <Text style={{ marginLeft: sizes.margins["1sm"] }}>
                <Text style={textStyle}>{text}</Text>
            </Text>
        </View>
    )
}
