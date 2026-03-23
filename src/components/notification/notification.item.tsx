import { View, ViewStyle } from "react-native"
import { Text } from "@/components/Themed"
import { UserShow } from "@/components/user_show"
import sizes from "@/constants/sizes"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import { NotificationType, type NotificationPayload } from "@/contexts/push.notification"
import { NotificationBadge } from "./notification.badge"
import { NotificationText } from "./notification.text"
import { useRouter, usePathname } from "expo-router"
import {
    GlassContainer,
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from "expo-glass-effect"
import { Platform } from "react-native"
import { Pressable } from "react-native"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import ProfileContext from "@/contexts/profile"

type NotificationItemProps = {
    item: NotificationPayload
}

export function NotificationItem({ item }: NotificationItemProps) {
    const router = useRouter()
    const pathname = usePathname()
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
        width: "100%",
        alignItems: "flex-start",
        justifyContent: "center",
        minHeight: sizes.screens.height * 0.08,
        paddingLeft: sizes.paddings["1sm"],
        paddingRight: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1md"] * 1.5,
        backgroundColor: colors.gray.grey_09,
    }

    const glassContainer: ViewStyle = {
        width: "100%",
        alignItems: "flex-start",
        justifyContent: "center",
        minHeight: sizes.screens.height * 0.08,
        paddingLeft: sizes.paddings["1sm"],
        paddingRight: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1md"] * 1.5,
        backgroundColor: "#00000000",
    }

    function handlePress() {
        const targetId = String(item.actor.id)
        const myId = String(session.user.id)
        const targetPath = `/profile/${targetId}`
        // Evitar navegação duplicada
        if (pathname === targetPath) return
        // Injeta no ProfileContext antes de navegar
        setProfilePreview({ id: targetId, username: String(item.actor.username || "") })
        setUserId(targetId)

        switch (item.type) {
            case NotificationType.HexEntry:
                router.push({ pathname: "/profile/[userId]", params: { userId: targetId } })
                break
            case NotificationType.UserFollowed:
                router.push({ pathname: "/profile/[userId]", params: { userId: targetId } })
                break
            case NotificationType.ProfileViewed:
                router.push({ pathname: "/profile/[userId]", params: { userId: targetId } })
                break
            default:
                break
        }
    }

    if (shouldUseGlass) {
        return (
            <GlassContainer spacing={10}>
                <GlassView
                    style={glassContainer}
                    colorScheme="dark"
                    glassEffectStyle="clear"
                    isInteractive={true}
                    tintColor={colors.gray.grey_09 + "90"}
                >
                    <UserShow.Root data={actor}>
                        <Pressable
                            onPress={handlePress}
                            style={{ flexDirection: "row", alignItems: "center" }}
                        >
                            <View style={{ marginRight: sizes.paddings["2sm"] }}>
                                <UserShow.ProfilePicture
                                    pictureDimensions={{
                                        width: sizes.sizes["3md"] * 1.1,
                                        height: sizes.sizes["3md"] * 1.1,
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
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <UserShow.Username
                                        margin={0}
                                        fontFamily={fonts.family["Semibold-Italic"]}
                                        fontSize={fonts.size.callout}
                                        textStyle={{
                                            fontStyle: "italic",
                                            color: colors.gray.grey_03 + 99,
                                        }}
                                        pressable={false}
                                        displayYou={true}
                                        displayOnMoment={false}
                                    />
                                </View>
                                <NotificationText item={item} />
                            </View>
                        </Pressable>
                    </UserShow.Root>
                </GlassView>
            </GlassContainer>
        )
    } else {
        return (
            <Pressable onPress={handlePress} style={container}>
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
                        <NotificationText item={item} />
                    </View>
                </UserShow.Root>
            </Pressable>
        )
    }
}

export default NotificationItem
