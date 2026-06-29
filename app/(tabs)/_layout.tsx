import { NativeTabs } from "expo-router/unstable-native-tabs"
import React from "react"
import { usePathname } from "expo-router"
import { Platform, DynamicColorIOS } from "react-native"
import { colors } from "@/constants/colors"
import LanguageContext from "@/contexts/language"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { useCameraContext } from "../../modules/camera"
import { usePushNotifications } from "@/contexts/push.notification"

export default function TabsLayout() {
    const { t } = React.useContext(LanguageContext)
    const { unreadCount, inboxVisited } = usePushNotifications()
    const badgeHidden = unreadCount === 0 || inboxVisited
    const { tabHide } = useCameraContext()
    const pathname = usePathname()
    const hideTabs = pathname?.startsWith("/(tabs)/moments/permissions")

    const tintColor = Platform.select({
        ios: DynamicColorIOS({
            dark:
                iOSMajorVersion && iOSMajorVersion >= 26
                    ? colors.purple.purple_03
                    : colors.purple.purple_04,
            light: colors.purple.purple_05,
        }),
    })

    return (
        <NativeTabs tintColor={tintColor}>
            <NativeTabs.Trigger name="moments">
                <NativeTabs.Trigger.Icon sf={{ default: "bolt", selected: "bolt.fill" }} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="inbox">
                <NativeTabs.Trigger.Icon sf={{ default: "bell", selected: "bell.fill" }} />
                {!badgeHidden && (
                    <NativeTabs.Trigger.Badge selectedBackgroundColor={colors.red.red_05}>
                        {unreadCount.toString()}
                    </NativeTabs.Trigger.Badge>
                )}
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="create">
                <NativeTabs.Trigger.Icon
                    sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="you">
                <NativeTabs.Trigger.Icon sf={{ default: "at", selected: "at" }} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="settings">
                <NativeTabs.Trigger.Icon sf={{ default: "gear", selected: "gear" }} />
            </NativeTabs.Trigger>
        </NativeTabs>
    )
}
