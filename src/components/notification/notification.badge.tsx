import React from "react"
import { View, ViewStyle } from "react-native"
import AtIcon from "@/assets/icons/svgs/@2.svg"
import GeoIcon from "@/assets/icons/svgs/bolt.svg"
import { NotificationType } from "@/contexts/push.notification"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"

export function NotificationBadge({ type }: { type: NotificationType }) {
    let Icon = AtIcon
    let color = colors.purple.purple_04

    switch (type) {
        case NotificationType.HexEntry:
            Icon = GeoIcon
            color = colors.blue.blue_05
            break
        case NotificationType.UserFollowed:
            Icon = AtIcon
            color = colors.purple.purple_04
            break
        case NotificationType.ProfileViewed:
            Icon = AtIcon
            color = colors.green.green_05
            break
        case NotificationType.MomentCommented:
            Icon = AtIcon
            color = colors.yellow.yellow_05
            break
        case NotificationType.MomentLiked:
            Icon = AtIcon
            color = colors.red.red_05
            break
        default:
            Icon = AtIcon
            color = colors.purple.purple_04
            break
    }

    const container: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        width: sizes.sizes["1md"] * 1.1,
        height: sizes.sizes["1md"] * 1.1,
        borderRadius: (sizes.sizes["1md"] * 1.1) / 2,
        borderWidth: 4,
        borderColor: colors.gray.grey_09,
        backgroundColor: color,
        overflow: "hidden",
        backfaceVisibility: "hidden",
    }

    return (
        <View style={container}>
            <Icon width={13} height={13} fill={colors.gray.white} />
        </View>
    )
}
