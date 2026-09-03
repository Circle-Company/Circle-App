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

function getTypeTitle(item: NotificationPayload) {
    switch (item.type) {
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
        case NotificationType.FriendRequestReceived:
            return "Want to be your friend"
        case NotificationType.FriendRequestAccepted:
            // No auto-aceite recíproco não houve "aceite" de ninguém: os dois
            // já tinham convidado o outro, então a amizade nasce pronta.
            return item.autoAccepted
                ? "You are friends now 🎉"
                : "Accepted your invite to be their friend 🎉"
        default:
            return "Notificação"
    }
}

export function NotificationText({ item, style }: NotificationTextProps) {
    const text = getTypeTitle(item)

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
