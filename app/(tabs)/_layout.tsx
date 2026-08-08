import { NativeTabs } from "expo-router/unstable-native-tabs"
import { usePathname } from "expo-router"
import React from "react"
import { Platform, DynamicColorIOS } from "react-native"
import { colors } from "@/constants/colors"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { usePushNotifications } from "@/contexts/push.notification"

export default function TabsLayout() {
    const pathname = usePathname()
    const { unreadCount, inboxVisited } = usePushNotifications()
    const hideTabBar =
        /^\/(you|moment)\/[^/]+/.test(pathname ?? "") ||
        /^\/(radar|inbox|settings)(\/|$)/.test(pathname ?? "")

    // O botão de notificações vive no header da câmera. Ao sair dessa aba o
    // header some, então espelhamos o badge no ícone da câmera na tab bar —
    // só enquanto NÃO estamos na aba da câmera.
    const isOnCamera = (pathname ?? "").startsWith("/create")
    const showCameraBadge = unreadCount > 0 && !inboxVisited && !isOnCamera
    const tintColor = Platform.select({
        ios: DynamicColorIOS({
            dark:
                iOSMajorVersion && iOSMajorVersion >= 26
                    ? colors.purple.purple_03
                    : colors.purple.purple_04,
            light: colors.purple.purple_05,
        }),
    })

    const indicatorColor =
        Platform.OS === "ios" && iOSMajorVersion && iOSMajorVersion >= 26
            ? colors.gray.grey_05
            : undefined

    return (
        <NativeTabs tintColor={tintColor} indicatorColor={indicatorColor} hidden={hideTabBar}>
            <NativeTabs.Trigger name="moments">
                <NativeTabs.Trigger.Icon
                    sf={{
                        default: "bolt",
                        selected: "bolt.fill",
                    }}
                />
                <NativeTabs.Trigger.Label hidden />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="create">
                <NativeTabs.Trigger.Icon
                    sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
                />
                <NativeTabs.Trigger.Label hidden />
                {showCameraBadge && (
                    <NativeTabs.Trigger.Badge selectedBackgroundColor={colors.red.red_05}>
                        {unreadCount > 99 ? "99+" : unreadCount.toString()}
                    </NativeTabs.Trigger.Badge>
                )}
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="you">
                <NativeTabs.Trigger.Icon sf={{ default: "at", selected: "at" }} />
                <NativeTabs.Trigger.Label hidden />
            </NativeTabs.Trigger>
        </NativeTabs>
    )
}
