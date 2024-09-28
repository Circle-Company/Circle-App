import LanguageContext from "@/contexts/Preferences/language"
import React from "react"
import { FlatList, ScrollView } from "react-native"
import { Settings } from "../../../../components/settings"

export default function PreferencesScreen() {
    const { t } = React.useContext(LanguageContext)
    const ListData = [
        {
            name: t("App"),
            content: [
                {
                    //icon: <LanguageIcon width={20} height={20} fill={ColorTheme().text} />,
                    name: t("Language"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Preferences-Language",
                    secure: false,
                },
                {
                    //icon: <HapticsIcon width={20} height={20} fill={ColorTheme().text} />,
                    name: t("Haptic Feedback"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Preferences-Haptics",
                    secure: false,
                },
                {
                    //icon: <NotificationIcon width={20} height={20} fill={ColorTheme().text} />,
                    name: t("Notifications"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Preferences-PushNotifications",
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
                    return (
                        <Settings.Section name={item.name} content={item.content} type="ACCOUNT" />
                    )
                }}
            />
        </ScrollView>
    )
}
