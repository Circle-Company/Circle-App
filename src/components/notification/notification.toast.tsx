import React from "react"
import { View, ViewStyle, Pressable, Platform } from "react-native"
import { Text } from "@/components/Themed"
import { UserShow } from "@/components/user_show"
import { NotificationBadge } from "./notification.badge"
import { NotificationText } from "./notification.text"
import { NotificationType, type NotificationPayload } from "@/contexts/push.notification"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import {
    GlassContainer,
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from "expo-glass-effect"
import { useRouter } from "expo-router"
import PersistedContext from "@/contexts/Persisted"
import ProfileContext from "@/contexts/profile"
import NotificationTextToast from "./notification.text.toast"

type NotificationToastProps = {
    item: NotificationPayload
    onDismiss?: () => void
}

export function NotificationToast({ item, onDismiss }: NotificationToastProps) {
    const router = useRouter()
    const { session } = React.useContext(PersistedContext)
    const { setUserId, setProfilePreview } = React.useContext(ProfileContext)

    const shouldUseGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const actor = {
        id: String(item.actor?.id || ""),
        username: String(item.actor?.username || ""),
        verified: false,
        profilePicture: String(item.actor?.profilePicture || ""),
    }

    const container: ViewStyle = {
        width: sizes.screens.width * 0.92,
        alignSelf: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: sizes.paddings["1sm"],
        paddingRight: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["1sm"],
        borderRadius: sizes.borderRadius["1lg"] * 1.2,
        backgroundColor: colors.gray.grey_09,
        minHeight: 70,
    }

    const glassContainer: ViewStyle = {
        width: sizes.screens.width * 0.92,
        alignSelf: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: sizes.paddings["1sm"],
        paddingRight: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["1sm"],
        borderRadius: sizes.borderRadius["1lg"] * 1.2,
        minHeight: 70,
    }

    function handlePress() {
        onDismiss?.()
        const targetId = String(item.actor.id)
        const myId = String(session?.user?.id)
        const isSelf = targetId === myId
        setProfilePreview({ id: targetId, username: String(item.actor.username || "") })
        setUserId(targetId)
        switch (item.type) {
            case NotificationType.UserFollowed:
            case NotificationType.ProfileViewed:
                if (isSelf)
                    router.push({
                        pathname: "/you/[id]",
                        params: { id: targetId, from: "profile" },
                    })
                else router.push({ pathname: "/profile/[userId]", params: { userId: targetId } })
                break
            default:
                break
        }
    }

    const inner = (
        <UserShow.Root data={actor}>
            <Pressable
                onPress={handlePress}
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
                <View
                    style={{
                        flex: 1,
                        marginLeft: sizes.paddings["2sm"],
                        marginRight: sizes.paddings["1sm"],
                    }}
                >
                    <Text
                        style={{
                            color: colors.gray.white,
                            fontFamily: fonts.family.Bold,
                            fontSize: fonts.size.callout * 1.1,
                            letterSpacing: -0.25,
                        }}
                    >
                        {item.title}
                    </Text>
                    <Text
                        style={{
                            color: colors.gray.white + 90,
                            fontFamily: fonts.family.Medium,
                            fontSize: fonts.size.body * 0.9,
                            letterSpacing: -0.1,
                        }}
                    >
                        {item.description}
                    </Text>
                </View>
            </Pressable>
        </UserShow.Root>
    )

    if (shouldUseGlass) {
        return (
            <GlassContainer spacing={10}>
                <GlassView
                    style={glassContainer}
                    colorScheme="dark"
                    glassEffectStyle="regular"
                    isInteractive={true}
                    tintColor={colors.gray.grey_09 + "99"}
                >
                    {inner}
                </GlassView>
            </GlassContainer>
        )
    }

    return <View style={container}>{inner}</View>
}

export default NotificationToast
