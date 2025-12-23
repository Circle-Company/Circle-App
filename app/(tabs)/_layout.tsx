import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs"
import React from "react"
import { Platform, DynamicColorIOS } from "react-native"
import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/Preferences/language"
import { View } from "react-native"
import { iOSMajorVersion } from "@/lib/platform/detection"

export default function TabsLayout() {
    const { t } = React.useContext(LanguageContext)

    const tintColor = Platform.select({
        ios: DynamicColorIOS({
            dark:
                iOSMajorVersion && iOSMajorVersion >= 26
                    ? colors.purple.purple_05
                    : colors.purple.purple_04,
            light: colors.purple.purple_05,
        }),
    })

    const labelColor = Platform.select({
        ios: DynamicColorIOS({
            dark: "white",
            light: iOSMajorVersion && iOSMajorVersion >= 26 ? "black" : "white",
        }),
    })

    return (
        <View style={{ flex: 1, backgroundColor: "#000" }}>
            <NativeTabs
                tintColor={tintColor}
                labelStyle={{
                    fontFamily: Fonts.family["Bold"],
                    fontSize: Fonts.size.body * 0.8,
                }}
                backBehavior="history"
                backgroundColor={
                    Platform.OS === "ios" && iOSMajorVersion && iOSMajorVersion < 26
                        ? colors.gray.black + "90"
                        : "transparent"
                }
                blurEffect={
                    Platform.OS === "ios" && iOSMajorVersion && iOSMajorVersion < 26
                        ? "dark"
                        : undefined
                }
                minimizeBehavior="onScrollDown"
            >
                <NativeTabs.Trigger name="moments" options={{}}>
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
            </NativeTabs>
        </View>
    )
}
