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

export function NotificationTextToast({ item, style }: NotificationTextProps) {
    return (
        <Text>
            
        </Text>
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
            {item.title}, {item.description}
        </Text>
    )
}

export default NotificationTextToast
