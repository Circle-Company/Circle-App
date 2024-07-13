import React from "react"
import { FlatList, ScrollView } from "react-native"
import { Settings } from "../../../../components/settings"

export default function PreferencesScreen() {
    const ListData = [
        {
            name: "Language",
            content: [
                {
                    name: "App Language",
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Privacy-Policy",
                    secure: false,
                },
            ],
        },
        {
            name: "Content",
            content: [
                {
                    name: "Auto Play",
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Privacy-Policy",
                    secure: false,
                },
                {
                    name: "Haptic Feedback",
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Privacy-Policy",
                    secure: false,
                },
                {
                    name: "Content Translation",
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Privacy-Policy",
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
