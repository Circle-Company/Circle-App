import React, { useMemo } from "react"
import { Text, TextStyle } from "react-native"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import type { NotificationPayload } from "@/contexts/push.notification"
import { NotificationType } from "@/contexts/push.notification"

type NotificationTextProps = {
    item: NotificationPayload
    description?: string
    style?: TextStyle
}

function buildTitle(type: NotificationType) {
    switch (type) {
        case NotificationType.HexEntry:
            return `Is close to you`
        case NotificationType.UserFollowed:
            return `Started following you`
        case NotificationType.ProfileViewed:
            return `Viewed your profile`
        case NotificationType.MomentCommented:
            return `Commented on your moment`
        case NotificationType.MomentLiked:
            return `Liked your moment`
        default:
            return `Você recebeu uma notificação`
    }
}

export function NotificationText({ item, description, style }: NotificationTextProps) {
    const title = useMemo(() => buildTitle(item.type), [item.type])
    const text = description ? `${title}, ${description}` : title

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
