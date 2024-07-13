import React from "react"
import { FlatList, ScrollView } from "react-native"
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

    const ListData = [
        {
            name: t("Public Profile"),
            content: [
                {
                    name: t("Profile Picture"),
                    value: null,
                    type: "IMAGE",
                    navigateTo: "Settings-ProfilePicture",
                    secure: false,
                },
                {
                    name: t("Name"),
                    value: name_text,
                    type: "TEXT",
                    navigateTo: "Settings-Name",
                    secure: false,
                },
                {
                    name: t("Description"),
                    value: description_text,
                    type: "TEXT",
                    navigateTo: "Settings-Description",
                    secure: false,
                },
            ],
        },
        {
            name: t("Account"),
            content: [
                {
                    name: t("Moments"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-All-Moments",
                    secure: false,
                },
                {
                    name: t("Password"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Password",
                    secure: true,
                },
            ],
        },
        {
            name: t("App"),
            content: [
                {
                    name: t("Language"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Preferences-Language",
                    secure: false,
                },
                {
                    name: t("Open Source"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Open-Source",
                    secure: false,
                },
                {
                    name: t("Version"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Version",
                    secure: false,
                },
            ],
        },
        {
            name: t("Legal"),
            content: [
                {
                    name: t("Privacy Policy"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Privacy-Policy",
                    secure: false,
                },
                {
                    name: t("Terms of Service"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Terms-Of-Service",
                    secure: false,
                },
                {
                    name: t("Community Guidelines"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Community-Guidelines",
                    secure: false,
                },
            ],
        },
        {
            name: t("More"),
            content: [
                {
                    name: t("Support"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Support",
                    secure: false,
                },
                {
                    name: t("Log Out"),
                    value: null,
                    type: "TEXT",
                    navigateTo: "Settings-Log-Out",
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
                            type="ACCOUNT"
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
