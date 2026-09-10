import { Animated, View } from "react-native"
import LanguageContext from "../../contexts/language"
import PersistedContext from "../../contexts/Persisted"
import React from "react"
import { SettignsSectionProps } from "../../components/settings/settings-types"
import { Settings } from "../../components/settings"
import { SettingsFooterComponent } from "./footer"
import { router } from "expo-router"
import config from "@/config"
import * as Browser from "expo-web-browser"
import sizes from "@/constants/sizes"
import { textLib } from "@/circle.text.library"
import { NotificationPermissionNotProvidedCard } from "@/components/notification/notification.not.provided.card"
import { PermissionStatus } from "expo-notifications"
import { usePushNotifications } from "@/contexts/push.notification"
import { colors } from "@/constants/colors"

import UserIcon from "@/assets/icons/svgs/user_circle-outline.svg"
import PersonIcon from "@/assets/icons/svgs/person.svg"
import LockIcon from "@/assets/icons/svgs/lock-outline.svg"
import DownloadIcon from "@/assets/icons/svgs/arrow.down.to.line.compact.svg"
import TextIcon from "@/assets/icons/svgs/textformat.svg"
import LockShieldIcon from "@/assets/icons/svgs/lock.shield.svg"
import MinusIcon from "@/assets/icons/svgs/minus.circle.svg"
import GlobeIcon from "@/assets/icons/svgs/globe.svg"
import ExitIcon from "@/assets/icons/svgs/rectangle.portrait.and.arrow.right.svg"
import MagazineIcon from "@/assets/icons/svgs/magazine.svg"
import DocIcon from "@/assets/icons/svgs/doc.svg"
import HelpIcon from "@/assets/icons/svgs/exclamationmark.bubble.svg"
import MessageIcon from "@/assets/icons/svgs/message.svg"
import { SwitchButton } from "@/components/general/switch-button"
import { useNotificationPreference } from "@/queries/notification.preferences"

export default function ListSettings() {
    const { session } = React.useContext(PersistedContext)

    const { t } = React.useContext(LanguageContext)
    const name_text = session.account.name
        ? textLib.conversor.sliceWithDots({
              text: session.account.name,
              size: 18,
          })
        : t("add new name")

    const { permissionStatus } = usePushNotifications()

    /*
     * Push de mensagem direta.
     *
     * É separado de silenciar uma conversa (que se faz dentro dela): este desliga o push de
     * **todas**. Nenhum dos dois afeta o recebimento das mensagens nem o contador de
     * não-lidas — o que muda é só o aviso.
     */
    const directMessages = useNotificationPreference("message")

    const ListData: SettignsSectionProps[] = [
        {
            name: t("Public Profile"),
            content: [
                {
                    name: t("Change profile picture"),
                    icon: <UserIcon fill={colors.gray.grey_03} width={24} height={24} />,
                    onPress: () => router.push("/settings/profile-picture"),
                },
                {
                    name: t("Change name"),
                    value: name_text,
                    icon: <TextIcon fill={colors.gray.grey_03} width={23} height={23} />,
                    onPress: () => router.push("/settings/name"),
                },
            ],
        },
        {
            name: t("Account"),
            content: [
                {
                    name: t("App language"),
                    icon: <GlobeIcon fill={colors.gray.grey_03} width={22} height={22} />,
                    onPress: () => router.push("/settings/language"),
                },
                {
                    name: t("Friends"),
                    icon: <PersonIcon fill={colors.gray.grey_03} width={22} height={22} />,
                    onPress: () => router.push("/settings/friends"),
                },
                {
                    name: t("Direct messages"),
                    icon: <MessageIcon fill={colors.gray.grey_03} width={22} height={22} />,
                    type: "Switch",
                    rightComponent: (
                        <SwitchButton
                            initialState={directMessages.enabled}
                            onPressEnable={directMessages.toggle}
                            onPressDisable={directMessages.toggle}
                        />
                    ),
                },
                {
                    name: t("Blocked users"),
                    icon: <LockIcon fill={colors.gray.grey_03} width={24} height={24} />,
                    onPress: () => router.push("/settings/blocked-users"),
                },
            ],
        },
        {
            name: t("Legal"),
            content: [
                {
                    name: t("Privacy policy"),
                    icon: <LockShieldIcon fill={colors.gray.grey_03} width={24} height={24} />,
                    onPress: () => {
                        Browser.openBrowserAsync(config.PRIVACY_POLICY_URL)
                    },
                },
                {
                    name: t("Terms of service"),
                    icon: <MagazineIcon fill={colors.gray.grey_03} width={24} height={24} />,
                    onPress: () => {
                        Browser.openBrowserAsync(config.TERMS_OF_SERVICE_URL)
                    },
                },
                {
                    name: t("Community guidelines"),
                    icon: <DocIcon fill={colors.gray.grey_03} width={22} height={22} />,
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
                    name: t("Help"),
                    value: config.CIRCLE_APP_URL.replace("https://www.", "") + "/help",
                    icon: (
                        <HelpIcon
                            fill={colors.gray.grey_03}
                            width={24}
                            height={24}
                            style={{ top: 1.5 }}
                        />
                    ),
                    onPress: () => {
                        Browser.openBrowserAsync(config.HELP_URL)
                    },
                },
                {
                    name: t("Log out"),
                    value: t("Signed with") + " @" + session.account.username,
                    icon: (
                        <ExitIcon
                            fill={colors.gray.grey_03}
                            width={23}
                            height={23}
                            style={{ left: 1 }}
                        />
                    ),
                    onPress: () => router.push("/settings/log-out"),
                },
                {
                    name: t("Download your data"),
                    icon: <DownloadIcon fill={colors.gray.grey_03} width={21} height={21} />,
                    onPress: () => router.push("/settings/personal-data"),
                },
                {
                    name: t("Delete my account"),
                    icon: <MinusIcon fill={colors.gray.grey_03} width={22} height={22} />,
                    onPress: () => router.push("/settings/exclude-account"),
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
                        <View style={{ marginBottom: sizes.margins["1md"] }}>
                            <NotificationPermissionNotProvidedCard />
                        </View>
                    )
                else return null
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
