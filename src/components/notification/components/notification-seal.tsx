import { View } from "react-native"
import Heart from '../../../assets/icons/svgs/heart.svg'
import Comment from '../../../assets/icons/svgs/message.svg'
import Eye from '../../../assets/icons/svgs/eye.svg'
import User from '../../../assets/icons/svgs/person.svg'
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { useIndividualNotificationContext } from "../notification-individual_context"
import React from "react"
export default function notification_seal() {
    const { notification } = useIndividualNotificationContext()
    const container : any = {
        position: 'absolute',
        bottom: 0,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.7,
        alignItems: 'center',
        borderColor: ColorTheme().background,
        justifyContent: 'center',
    }

    if(notification.type === 'FOLLOW-USER') {
        return (
            <View style={[container, {backgroundColor: String(ColorTheme().user)}]}>
                <User width={10} height={10} fill={colors.gray.white.toString()}/>
            </View>
        )        
    } else if(notification.type === 'VIEW-USER') {
        return (
            <View style={[container, {backgroundColor: String(ColorTheme().view)}]}>
                <Eye width={10} height={10} fill={colors.gray.white.toString()}/>
            </View>
        )        
    } else if(notification.type === 'COMMENT-MOMENT') {
        return (
            <View style={[container, {backgroundColor: String(ColorTheme().comment)}]}>
                <Comment width={10} height={10} fill={colors.gray.white.toString()}/>
            </View>
        )        
    } else {
        return (
            <View style={[container, {backgroundColor: String(ColorTheme().like)}]}>
                <Heart width={10} height={10} fill={colors.gray.white.toString()}/>
            </View>
        )        
    }


}