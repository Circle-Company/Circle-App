import { NativeTabs, Icon, Label, Badge } from "expo-router/unstable-native-tabs"
import React from "react"
import { usePathname } from "expo-router"
import { Platform, DynamicColorIOS } from "react-native"
import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { View } from "react-native"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { useCameraContext } from "../../modules/camera"
import { usePushNotifications } from "@/contexts/push.notification"
import { Text } from "@/components/Themed"

export default function TabsLayout() {
    const { t } = React.useContext(LanguageContext)
    const { unreadCount } = usePushNotifications()
    const { tabHide } = useCameraContext()
    const pathname = usePathname()
    const hideTabs = pathname?.startsWith("/(tabs)/moments/permissions")

    const tintColor = Platform.select({
        ios: DynamicColorIOS({
            dark:
                iOSMajorVersion && iOSMajorVersion >= 26
                    ? colors.purple.purple_05
                    : colors.purple.purple_04,
            light: colors.purple.purple_05,
        }),
    })

    return (
        <View style={{ flex: 1, backgroundColor: "#000" }}>
            <NativeTabs
                tintColor={tintColor}
                labelStyle={{
                    fontFamily: Fonts.family["Bold"],
                    fontSize: Fonts.size.body * 0.75,
                }}
                backgroundColor={
                    Platform.OS === "ios" && iOSMajorVersion && iOSMajorVersion < 26
                        ? colors.gray.black + "90"
                        : "transparent"
                }
                blurEffect={
                    Platform.OS === "ios" && iOSMajorVersion && iOSMajorVersion < 26
                        ? "systemMaterialDark"
                        : undefined
                }
                minimizeBehavior={hideTabs ? "never" : "onScrollDown"}
            >
                <NativeTabs.Trigger name="moments">
                    <Label selectedStyle={{ color: tintColor }}>{t("Moments")}</Label>
                    <Icon sf={{ default: "bolt", selected: "bolt.fill" }} />
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="inbox">
                    <Label selectedStyle={{ color: tintColor }}>{t("Inbox")}</Label>
                    <Icon sf={{ default: "bell", selected: "bell.fill" }} />
                    <Badge hidden={unreadCount === 0} selectedBackgroundColor={colors.red.red_05}>
                        {unreadCount.toString()}
                    </Badge>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="create">
                    <Label selectedStyle={{ color: tintColor }}>{t("Create")}</Label>
                    <Icon sf={{ default: "plus.circle", selected: "plus.circle.fill" }} />
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="you">
                    <Label selectedStyle={{ color: tintColor }}>{t("You")}</Label>
                    <Icon sf={{ default: "at", selected: "at" }} />
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="settings">
                    <Label selectedStyle={{ color: tintColor }}>{t("Settings")}</Label>
                    <Icon sf={{ default: "gear", selected: "gear" }} />
                </NativeTabs.Trigger>
            </NativeTabs>
        </View>
    )
}
