import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useColorScheme } from "react-native"
import SettingsHeaderLeft from "../../components/headers/settings/settings-header_left"
import LanguageContext from "../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../layout/constants/colors"
import Sizes from "../../layout/constants/sizes"
import SettingsScreen from "../../pages/app/Settings"
import AllMomentsScreen from "../../pages/app/Settings/AllMoments"
import SettingsCommunityGuidelines from "../../pages/app/Settings/CommunityGuidelines"
import SettingsDescriptionScreen from "../../pages/app/Settings/Description"
import LogOutScreen from "../../pages/app/Settings/LogOut"
import SettingsNameScreen from "../../pages/app/Settings/Name"
import OpenSourceScreen from "../../pages/app/Settings/OpenSource"
import SettingsPasswordScreen from "../../pages/app/Settings/Password"
import PreferencesScreen from "../../pages/app/Settings/Preferences"
import ContentScreen from "../../pages/app/Settings/Preferences/Content"
import LanguageScreen from "../../pages/app/Settings/Preferences/Language"
import SettingsPrivacyPolicy from "../../pages/app/Settings/PrivacyPolicy"
import ProfilePictureScreen from "../../pages/app/Settings/ProfilePicture"
import SupportScreen from "../../pages/app/Settings/Support"
import SettingsTermsOfService from "../../pages/app/Settings/TermsOfService"
import VersionScreen from "../../pages/app/Settings/Version"

const SettingsStack = createStackNavigator()

export function SettingsNavigator() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
        borderBottomWidth: 1,
        borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
    }

    return (
        <SettingsStack.Navigator
            screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}
        >
            <SettingsStack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    headerTitle: t("Settings"),
                    headerStyle: HeaderStyle,
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
                }}
            />
            <SettingsStack.Screen
                name="Settings-Push-Notifications"
                component={SettingsScreen}
                options={{
                    headerTitle: t("Push Notifications"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
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
                }}
            />
        </SettingsStack.Navigator>
    )
}
