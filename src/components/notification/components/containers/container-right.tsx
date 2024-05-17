import { View } from "react-native"
import Heart from '../../../assets/icons/svgs/heart.svg'
import Comment from '../../../assets/icons/svgs/message.svg'
import Eye from '../../../assets/icons/svgs/eye.svg'
import User from '../../../assets/icons/svgs/user.svg'
import { colors } from "../../../../layout/constants/colors"
import React from "react"
import sizes from "../../../../layout/constants/sizes"

type NotificationContainerProps = {
    children: React.ReactNode
}
export default function container_right({
    children
}: NotificationContainerProps) {
    const container : any = {
        height: sizes.headers.height*0.9,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    }

    return (
        <View style={container}>
            {children}
        </View>
    )
}