import { View } from "react-native"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { useIndividualNotificationContext } from "../notification-individual_context"
import React from "react"
import { Text } from "../../Themed"
import { UserShow } from "../../user_show"
import { timeDifferenceConverter } from "../../../algorithms/dateConversor"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import LanguageContext from "../../../contexts/Preferences/language"

export default function notification_text() {
    const { notification } = useIndividualNotificationContext()
    const {t} = React.useContext(LanguageContext)
    const [text, setText] = React.useState<string>('')

    const notificactionsText = {
        "LIKE-MOMENT": t("liked your moment"),
        "LIKE-MOMENT-2": t("liked 2 of your moments"),
        "LIKE-MOMENT-3": t("liked 3 of your moments"),
        "LIKE-MEMORY": t("liked your memory"),
        "LIKE-COMMENT": t("liked your comment"),
        "COMMENT-MOMENT": t("commented on your moment"),
        "FOLLOW-USER": t("is following you"),
        "VIEW-USER": t("viewed your profile"),
    }

    React.useEffect(() => {
        if (notification.type) setText(notificactionsText[notification.type]);
    }, [notification]);


    const containerStyle: any = {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    };

    const textStyle: any = {
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.body * 0.9,
        lineHeight: 15,
    };

    const dataTextStyle: any = {
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().textDisabled,
        fontSize: fonts.size.body * 0.9,
        lineHeight: 15,
    };

    return (
        <View style={containerStyle}>
            <UserShow.Root data={notification.sender_user}>
                <UserShow.Username displayOnMoment={false} fontSize={fonts.size.body * 0.9}/>                
            </UserShow.Root>      
            <Text style={{marginLeft: sizes.margins["1sm"]}}>  
            <Text style={textStyle}>{text}</Text>
            <Text style={dataTextStyle}> {timeDifferenceConverter({ date: notification.created_at, small: true })}</Text>                
            </Text>            
        


        </View>
    );



}