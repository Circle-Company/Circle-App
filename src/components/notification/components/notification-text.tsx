import { View } from "react-native"

import ColorTheme, { colors } from "../../../layout/constants/colors"
import { useIndividualNotificationContext } from "../notification-individual_context"
import React from "react"
import { Text } from "../../Themed"
import { UserShow } from "../../user_show"
import { NotificationProps } from "../notification-types"
import { NotificationTextData } from "../data/text"
import { timeDifferenceConverter } from "../../../algorithms/dateConversor"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"

export default function notification_text() {
    const { notification } = useIndividualNotificationContext()
    const [text, setText] = React.useState<string>('')

    React.useEffect(() => {
        if (notification.type in NotificationTextData) setText(NotificationTextData[notification.type]);
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