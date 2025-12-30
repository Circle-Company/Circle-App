import { FlatList, ScrollView } from "react-native"

import NotificationIcon from "@/assets/icons/svgs/bell_fill.svg"
import HapticsIcon from "@/assets/icons/svgs/hand_tap_fill.svg"
import LanguageIcon from "@/assets/icons/svgs/text_format.svg"
import React from "react"
import { Settings } from "../../../../components/settings"
import ColorTheme from "../../../../constants/colors"
import LanguageContext from "../../../../contexts/Preferences/language"

export default function PreferencesScreen() {
    const { t, atualAppLanguage } = React.useContext(LanguageContext)
    const ListData = [
        {
            name: t("App"),
            content: [
                {
                    name: t("Language"),
                    value: atualAppLanguage.nativeName,
                    type: "TEXT" as const,
                    navigateTo: "Settings-Preferences-Language",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Haptic Feedback"),
                    value: "",
                    type: "TEXT" as const,
                    navigateTo: "Settings-Preferences-Haptics",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
            ],
        },
    ]
    return (
        <ScrollView>
            <FlatList
                data={ListData}
                scrollEnabled={false}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => {
                    return <Settings.Section name={item.name} content={item.content} />
                }}
            />
        </ScrollView>
    )
}
