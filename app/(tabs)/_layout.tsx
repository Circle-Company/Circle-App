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
                fontFamily: Fonts.family["Bold-Italic"],
                fontSize: Fonts.size.body * 0.9,
            }}
            minimizeBehavior="onScrollDown"
            labelVisibilityMode="unlabeled"
            titlePositionAdjustment={{ vertical: 10 }}
        >
            <NativeTabs.Trigger
                name="moments"
                options={{
                    backgroundColor: "#F2F",
                }}
            >
                <Label selectedStyle={{ color: tintColor }}>{t("Moments")}</Label>
                <Icon sf={{ default: "bolt", selected: "bolt.fill" }} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="create">
                <Label selectedStyle={{ color: tintColor }}>{t("Create")}</Label>
                <Icon sf={{ default: "camera", selected: "camera.fill" }} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="you">
                <Label selectedStyle={{ color: tintColor }}>{t("You")}</Label>
                <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
            </NativeTabs.Trigger>
        </NativeTabs>
    )
}
