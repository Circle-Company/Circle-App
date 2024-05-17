import { View } from "react-native"
import Heart from '../../../assets/icons/svgs/heart.svg'
import Comment from '../../../assets/icons/svgs/message.svg'
import Eye from '../../../assets/icons/svgs/eye.svg'
import User from '../../../assets/icons/svgs/person.svg'
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { useIndividualNotificationContext } from "../notification-individual_context"
import React from "react"
type NotificationViewedProps = {
    viewed: boolean
}
export default function notification_viewed({
    viewed
}: NotificationViewedProps) {
    const { notification } = useIndividualNotificationContext()
    const container : any = {
        width: 5,
        height: 16,
        borderRadius: 2.5,
        left: -5,
        backgroundColor: String(ColorTheme().view)
    }

    if(!viewed) {
        return (
            <View style={ container }/>
        )        
    } else return null


}