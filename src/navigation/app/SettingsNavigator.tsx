import { createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack'
import React from 'react'
import ColorTheme, { colors } from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import Fonts from '../../layout/constants/fonts'
import SettingsScreen from '../../pages/app/Settings'
import SettingsPrivacyPolicy from '../../pages/app/Settings/PrivacyPolicy'
import SettingsTermsOfService from '../../pages/app/Settings/TermsOfService'
import SettingsPasswordScreen from '../../pages/app/Settings/Password'
import SettingsNameScreen from '../../pages/app/Settings/Name'
import SettingsDescriptionScreen from '../../pages/app/Settings/Description'
import SettingsHeaderRight from '../../components/headers/account/account-header_right'
import SettingsHeaderLeft from '../../components/headers/settings/settings-header_left'
import { useColorScheme } from 'react-native'
import OpenSourceScreen from '../../pages/app/Settings/OpenSource'
import VersionScreen from '../../pages/app/Settings/Version'
import LogOutScreen from '../../pages/app/Settings/LogOut'
import AllMomentsScreen from '../../pages/app/Settings/AllMoments'
import PreferencesScreen from '../../pages/app/Settings/Preferences'
import LanguageScreen from '../../pages/app/Settings/Preferences/Language'
import ContentScreen from '../../pages/app/Settings/Preferences/Content'

const SettingsStack = createStackNavigator()
 
export function SettingsNavigator() {

    const isDarkMode = useColorScheme() === 'dark'
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
        borderBottomWidth: 1,
        borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02
    }
   
  return (
    <SettingsStack.Navigator 
        screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
    >
        <SettingsStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
                headerTitle: 'Settings',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
                headerLeft: () => <SettingsHeaderLeft/>
            }}
            
        />
        <SettingsStack.Screen
            name="Settings-Description"
            component={SettingsDescriptionScreen}
            options={{
                headerTitle: 'Add Description',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Name"
            component={SettingsNameScreen}
            options={{
                headerTitle: 'Add Name',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Password"
            component={SettingsPasswordScreen}
            options={{
                headerTitle: 'Change Password',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Privacy-Policy"
            component={SettingsPrivacyPolicy}
            options={{
                headerTitle: 'Privacy Policy',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Terms-Of-Service"
            component={SettingsTermsOfService}
            options={{
                headerTitle: 'Terms of Service',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Push-Notifications"
            component={SettingsScreen}
            options={{
                headerTitle: 'Push Notifications',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-All-Moments"
            component={AllMomentsScreen}
            options={{
                headerTitle: 'All Moments',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Preferences"
            component={PreferencesScreen}
            options={{
                headerTitle: 'Preferences',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Preferences-Language"
            component={LanguageScreen}
            options={{
                headerTitle: 'Language',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Preferences-Content"
            component={ContentScreen}
            options={{
                headerTitle: 'Content',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Open-Source"
            component={OpenSourceScreen}
            options={{
                headerTitle: 'Open Source',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Version"
            component={VersionScreen}
            options={{
                headerTitle: 'Version',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Log-Out"
            component={LogOutScreen}
            options={{
                headerTitle: 'Log Out',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text), 
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
    </SettingsStack.Navigator>
  )
}