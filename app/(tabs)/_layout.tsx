import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs"
import React from "react"
import { Platform, DynamicColorIOS } from "react-native"
import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { View } from "react-native"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { useCameraContext } from "../../modules/camera"

export default function TabsLayout() {
    const { t } = React.useContext(LanguageContext)
    const { tabHide } = useCameraContext()

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
                labelVisibilityMode="unlabeled"
                labelStyle={{
                    fontFamily: Fonts.family["Bold"],
                    fontSize: Fonts.size.body * 0.8,
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
                minimizeBehavior="onScrollDown"
            >
                <NativeTabs.Trigger name="moments">
                    <Label selectedStyle={{ color: tintColor }}>{t("Moments")}</Label>
                    <Icon sf={{ default: "bolt", selected: "bolt.fill" }} />
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
