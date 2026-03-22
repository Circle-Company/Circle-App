import { Animated } from "react-native"

import LanguageContext from "../../contexts/language"
import PersistedContext from "../../contexts/Persisted"
import React from "react"
import { SettignsSectionProps } from "../../components/settings/settings-types"
import { Settings } from "../../components/settings"
import { SettingsFooterComponent } from "./footer"
import { router } from "expo-router"
import config from "@/config"
import * as Browser from "expo-web-browser"
import { SwitchButton } from "@/components/general/switch-button"
import { useDisableHapticsMutation, useEnableEnableMutation } from "@/queries/preferences.haptic"
import { View } from "react-native"
import sizes from "@/constants/sizes"
import { textLib } from "@/circle.text.library"
import { NotificationPermissionNotProvidedCard } from "@/components/notification/notification.not.provided.card"
import { PermissionStatus } from "expo-notifications"
import { usePushNotifications } from "@/contexts/push.notification"

export default function ListSettings() {
    const { session } = React.useContext(PersistedContext)
    const preferencesState = session.preferences.content

    const { t } = React.useContext(LanguageContext)
    const name_text = session.user.name
        ? textLib.conversor.sliceWithDots({
              text: session.user.name,
              size: 18,
          })
        : t("add new name")
    const description_text = session.user.description
        ? textLib.conversor.sliceWithDots({
              text: session.user.description.replace(/(\r\n|\n|\r)/gm, " "),
              size: 18,
          })
        : t("add new description")

    const disableHapticsMutation = useDisableHapticsMutation()
    const enableHapticsMutation = useEnableEnableMutation()

    const { permissionStatus } = usePushNotifications()

    const ListData: SettignsSectionProps[] = [
        {
            name: t("Public Profile"),
            content: [
                {
                    name: t("Profile Picture"),
                    type: "IMAGE",
                    onPress: () => router.push("/(tabs)/settings/profile-picture"),
                },
                {
                    name: t("Name"),
                    value: name_text,
                    onPress: () => router.push("/(tabs)/settings/name"),
                },
            ],
        },
        {
            name: t("Account"),
            content: [
                {
                    name: t("Language"),
                    onPress: () => router.push("/(tabs)/settings/language"),
                },
                {
                    name: t("Blocked Users"),
                    onPress: () => router.push("/(tabs)/settings/blocked-users"),
                },
                {
                    name: t("Personal Data"),
                    onPress: () => router.push("/(tabs)/settings/personal-data"),
                },
            ],
        },
        {
            name: t("Legal"),
            content: [
                {
                    name: t("Privacy Policy"),
                    onPress: () => {
                        Browser.openBrowserAsync(config.PRIVACY_POLICY_URL)
                    },
                },
                {
                    name: t("Terms of Service"),
                    onPress: () => {
                        Browser.openBrowserAsync(config.TERMS_OF_SERVICE_URL)
                    },
                },
                {
                    name: t("Community Guidelines"),
                    onPress: () => {
                        Browser.openBrowserAsync(config.COMMUNITY_GUIDELINES_URL)
                    },
                },
            ],
        },
        {
            name: t("More"),
            content: [
                {
                    name: t("Support"),
                    value: config.CIRCLE_APP_URL.replace("https://www.", "") + "/contact-us",
                    onPress: () => {
                        Browser.openBrowserAsync(config.CONTACT_US_URL)
                    },
                },
                {
                    name: t("Help"),
                    value: config.CIRCLE_APP_URL.replace("https://www.", "") + "/help",
                    onPress: () => {
                        Browser.openBrowserAsync(config.HELP_URL)
                    },
                },
                {
                    name: t("Log Out"),
                    value: t("Signed with") + " @" + session.user.username,
                    onPress: () => router.push("/(tabs)/settings/log-out"),
                },
                {
                    name: t("Delete Account"),
                    onPress: () => router.push("/(tabs)/settings/exclude-account"),
                },
            ],
        },
    ]

    return (
        <Animated.FlatList
            data={ListData}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.name}
            scrollEventThrottle={16}
            ListHeaderComponent={() => {
                if (
                    permissionStatus === PermissionStatus.UNDETERMINED ||
                    permissionStatus === PermissionStatus.DENIED
                )
                    return (
                        <View>
                            <View style={{ height: sizes.headers.height * 1.5 }} />
                            <View style={{ marginBottom: sizes.margins["1md"] }}>
                                <NotificationPermissionNotProvidedCard />
                            </View>
                        </View>
                    )
                else return <View style={{ height: sizes.headers.height * 1.45 }}></View>
            }}
            renderItem={({ item, index }) => {
                return (
                    <Animated.View key={index}>
                        <Settings.Section name={item.name} content={item.content} />
                    </Animated.View>
                )
            }}
            ListFooterComponent={() => {
                return <SettingsFooterComponent />
            }}
        />
    )
}
