import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs"
import React from "react"
import { Platform, DynamicColorIOS } from "react-native"
import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/Preferences/language"

export default function TabsLayout() {
    const { t } = React.useContext(LanguageContext)
    const tintColor = Platform.select({
        ios: DynamicColorIOS({
            dark: colors.purple.purple_04,
            light: colors.purple.purple_05,
        }),
    })

    const labelColor = Platform.select({
        ios: DynamicColorIOS({
            dark: "white",
            light: "black",
        }),
    })

    return (
        <NativeTabs
            tintColor={tintColor}
            labelStyle={{
                color: labelColor,
                fontFamily: Fonts.family["Bold"],
                fontSize: Fonts.size.body * 0.8,
            }}
            minimizeBehavior="onScrollDown"
        >
            <NativeTabs.Trigger name="moments" options={{}}>
                <Label selectedStyle={{ color: tintColor }}>{t("Moments")}</Label>
                <Icon sf={{ default: "bolt.fill", selected: "bolt.fill" }} />
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
    )
}
