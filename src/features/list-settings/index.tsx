import { FlatList, ScrollView } from "react-native"

import { SettignsSectionProps } from "@/components/settings/settings-types"
import React from "react"
import { Settings } from "../../components/settings"
import PersistedContext from "../../contexts/Persisted"
import LanguageContext from "../../contexts/Preferences/language"
import { truncated } from "../../helpers/processText"
import { SettingsFooterComponent } from "./footer"

export default function ListSettings() {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const name_text = session.user.name
        ? truncated({ text: session.user.name, size: 18 })
        : t("add new name")
    const description_text = session.user.description
        ? truncated({ text: session.user.description.replace(/(\r\n|\n|\r)/gm, " "), size: 18 })
        : t("add new description")

    const ListData: Array<SettignsSectionProps> = [
        {
            name: t("Public Profile"),
            content: [
                {
                    name: t("Profile Picture"),
                    value: "",
                    type: "IMAGE",
                    navigateTo: "Settings-ProfilePicture",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Name"),
                    value: name_text,
                    type: "TEXT",
                    navigateTo: "Settings-Name",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Description"),
                    value: description_text,
                    type: "TEXT",
                    navigateTo: "Settings-Description",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
            ],
        },
        {
            name: t("Account"),
            content: [
                {
                    name: t("Your Moments"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-All-Moments",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Preferences"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-Preferences",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Password"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-Password",
                    navigator: "SettingsNavigator",
                    secure: true,
                },
            ],
        },
        {
            name: t("Legal"),
            content: [
                {
                    name: t("Privacy Policy"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-Privacy-Policy",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Terms of Service"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-Terms-Of-Service",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Community Guidelines"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-Community-Guidelines",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
            ],
        },
        {
            name: t("More"),
            content: [
                {
                    name: t("Open Source"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-Open-Source",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Version"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-Version",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Support"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-Support",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
                {
                    name: t("Log Out"),
                    value: "",
                    type: "TEXT",
                    navigateTo: "Settings-Log-Out",
                    navigator: "SettingsNavigator",
                    secure: false,
                },
            ],
        },
    ]
    return (
        <ScrollView showsVerticalScrollIndicator={false} horizontal={false}>
            <FlatList
                data={ListData}
                scrollEnabled={false}
                keyExtractor={(item) => item.name}
                renderItem={({ item, index }) => {
                    return (
                        <Settings.Section
                            key={index}
                            name={item.name}
                            content={item.content}
                        />
                    )
                }}
                ListFooterComponent={() => {
                    return <SettingsFooterComponent />
                }}
            />
        </ScrollView>
    )
}
