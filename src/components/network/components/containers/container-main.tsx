import { View } from "react-native"
import Heart from '../../../assets/icons/svgs/heart.svg'
import Comment from '../../../assets/icons/svgs/message.svg'
import Eye from '../../../assets/icons/svgs/eye.svg'
import User from '../../../assets/icons/svgs/user.svg'
import { colors } from "../../../../layout/constants/colors"
import React from "react"
import sizes from "../../../../layout/constants/sizes"
import IndividualNotificationContext from "../../notification-individual_context"
import { NotificationProps } from "../../notification-types"

type NotificationContainerProps = {
    children: React.ReactNode,
    notification: NotificationProps
}
export default function container_main({
    children, notification
}: NotificationContainerProps) {
    const container : any = {
        width: sizes.screens.width,
        minHeight: sizes.headers.height*0.9,
        maxHeight: sizes.headers.height*1.8,
        paddingHorizontal: sizes.paddings["2sm"],
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    }

    return (
        <IndividualNotificationContext.Provider value={{notification: notification}}>
            <View style={container}>
                {children}
            </View>            
        </IndividualNotificationContext.Provider>

    )
}