import React from "react"
import { Text, TextStyle } from "react-native"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import type { NotificationPayload } from "@/contexts/push.notification"
import { NotificationType } from "@/contexts/push.notification"

type NotificationTextProps = {
    item: NotificationPayload
    style?: TextStyle
}

function getTypeTitle(type: NotificationType) {
    switch (type) {
        case NotificationType.HexEntry:
            return "Is close to you right now, see their profile before their gone"
        case NotificationType.UserFollowed:
            return "Is following you now"
        case NotificationType.ProfileViewed:
            return "Visited your profile"
        case NotificationType.MomentCommented:
            return "Commented on your moment"
        case NotificationType.MomentLiked:
            return "Novo like"
        default:
            return "Notificação"
    }
}

export function NotificationText({ item, style }: NotificationTextProps) {
    const text = getTypeTitle(item.type)

    return (
        <Text
            style={[
                {
                    color: colors.gray.white,
                    fontFamily: fonts.family.Bold,
                    fontSize: fonts.size.callout,
                    letterSpacing: -0.25,
                },
                style,
            ]}
            numberOfLines={2}
        >
            {text}
        </Text>
    )
}

export default NotificationText
