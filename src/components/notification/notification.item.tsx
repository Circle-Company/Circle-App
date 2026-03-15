import { View, ViewStyle } from "react-native"
import { Text } from "@/components/Themed"
import { UserShow } from "@/components/user_show"
import sizes from "@/constants/sizes"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import type { NotificationPayload } from "@/contexts/push.notification"
import { NotificationBadge } from "./notification.badge"
import { NotificationText } from "./notification.text"

type NotificationItemProps = {
    item: NotificationPayload
}

function formatCreatedAt(value?: string) {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
}

export function NotificationItem({ item }: NotificationItemProps) {
    const isRead = !!item.readAt
    const actor = {
        id: String(item.actor?.id || ""),
        username: String(item.actor?.username || ""),
        verified: false,
        profilePicture: String(item.actor?.profilePicture || ""),
    }

    const container: ViewStyle = {
        width: "100%",
        alignItems: "flex-start",
        justifyContent: "center",
        minHeight: sizes.screens.height * 0.1,
        paddingLeft: sizes.paddings["1sm"],
        paddingRight: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1md"] * 1.5,
        backgroundColor: colors.gray.grey_09,
    }

    return (
        <View style={container}>
            <UserShow.Root data={actor}>
                <View style={{ marginRight: sizes.paddings["2sm"] }}>
                    <UserShow.ProfilePicture
                        pictureDimensions={{
                            width: sizes.sizes["3md"] * 1.2,
                            height: sizes.sizes["3md"] * 1.2,
                        }}
                        disableAction={true}
                        displayOnMoment={false}
                    />
                    <View
                        style={{
                            position: "absolute",
                            bottom: -4,
                            right: -sizes.sizes["1sm"] * 0.8,
                        }}
                    >
                        <NotificationBadge type={item.type} />
                    </View>
                </View>
                <View style={{ flex: 1, gap: sizes.paddings["1sm"] * 0.5 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <UserShow.Username
                            margin={0}
                            fontFamily={fonts.family["Semibold-Italic"]}
                            fontSize={fonts.size.callout}
                            textStyle={{ fontStyle: "italic", color: colors.gray.grey_03 + 99 }}
                            pressable={false}
                            displayYou={true}
                            displayOnMoment={false}
                        />
                    </View>
                    <NotificationText item={item} description={item.text} />
                </View>
            </UserShow.Root>
        </View>
    )
}

export default NotificationItem
