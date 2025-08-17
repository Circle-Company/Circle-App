import AllMomentsScreen from "../../pages/app/Settings/AllMoments"
import ColorTheme from "../../layout/constants/colors"
import ContentScreen from "../../pages/app/Settings/Preferences/Content"
import FollowingScreen from "@/pages/app/Settings/Following"
import { Interpolation as Horizontal } from "../transitions/horizontal-right"
import LanguageContext from "../../contexts/Preferences/language"
import LanguageScreen from "../../pages/app/Settings/Preferences/Language"
import LogOutScreen from "../../pages/app/Settings/LogOut"
import OpenSourceScreen from "../../pages/app/Settings/OpenSource"
import PreferencesScreen from "../../pages/app/Settings/Preferences"
import ProfilePictureScreen from "../../pages/app/Settings/ProfilePicture"
import React from "react"
import SettingsCommunityGuidelines from "../../pages/app/Settings/CommunityGuidelines"
import SettingsDescriptionScreen from "../../pages/app/Settings/Description"
import SettingsHapticFeedback from "../../pages/app/Settings/HapticFeedback"
import SettingsHeaderLeft from "../../components/headers/settings/settings-header_left"
import SettingsNameScreen from "../../pages/app/Settings/Name"
import SettingsPasswordScreen from "../../pages/app/Settings/Password"
import SettingsPrivacyPolicy from "../../pages/app/Settings/PrivacyPolicy"
import SettingsPushNotifications from "../../pages/app/Settings/PushNotifications"
import SettingsScreen from "../../pages/app/Settings"
import SettingsTermsOfService from "../../pages/app/Settings/TermsOfService"
import Sizes from "../../layout/constants/sizes"
import SupportScreen from "../../pages/app/Settings/Support"
import VersionScreen from "../../pages/app/Settings/Version"
import { createStackNavigator } from "@react-navigation/stack"
import { useColorScheme } from "react-native"

const SettingsStack = createStackNavigator()

export function SettingsNavigator() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    return (
        <SettingsStack.Navigator screenOptions={{ cardStyleInterpolator: Horizontal }}>
            <SettingsStack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    headerTitle: t("Settings"),
                    headerStyle: [HeaderStyle, {borderBottomWidth: 0, borderBottomColor: "transparent"}],
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-ProfilePicture"
                component={ProfilePictureScreen}
                options={{
                    headerTitle: t("Add Profile Picture"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Description"
                component={SettingsDescriptionScreen}
                options={{
                    headerTitle: t("Add Description"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Followings"
                component={FollowingScreen}
                options={{
                    headerTitle: t("Following"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Name"
                component={SettingsNameScreen}
                options={{
                    headerTitle: t("Add Name"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Password"
                component={SettingsPasswordScreen}
                options={{
                    headerTitle: t("Change Password"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Privacy-Policy"
                component={SettingsPrivacyPolicy}
                options={{
                    headerTitle: t("Privacy Policy"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Terms-Of-Service"
                component={SettingsTermsOfService}
                options={{
                    headerTitle: t("Terms of Service"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Community-Guidelines"
                component={SettingsCommunityGuidelines}
                options={{
                    headerTitle: t("Community Guidelines"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Preferences-PushNotifications"
                component={SettingsPushNotifications}
                options={{
                    headerTitle: t("Notifications"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-All-Moments"
                component={AllMomentsScreen}
                options={{
                    headerTitle: t("All Moments"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Preferences"
                component={PreferencesScreen}
                options={{
                    headerTitle: t("Preferences"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Preferences-Language"
                component={LanguageScreen}
                options={{
                    headerTitle: t("Language"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Preferences-Content"
                component={ContentScreen}
                options={{
                    headerTitle: t("Content"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />

            <SettingsStack.Screen
                name="Settings-Preferences-Haptics"
                component={SettingsHapticFeedback}
                options={{
                    headerTitle: t("Haptic Feedback"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Open-Source"
                component={OpenSourceScreen}
                options={{
                    headerTitle: t("Open Source"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Support"
                component={SupportScreen}
                options={{
                    headerTitle: t("Support"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Version"
                component={VersionScreen}
                options={{
                    headerTitle: t("Version"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
            <SettingsStack.Screen
                name="Settings-Log-Out"
                component={LogOutScreen}
                options={{
                    headerTitle: t("Log Out"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <SettingsHeaderLeft />,
                }}
            />
        </SettingsStack.Navigator>
    )
}
