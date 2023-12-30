import { createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack'
import React from 'react'
import ColorTheme, { colors } from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import Fonts from '../../layout/constants/fonts'
import SettingsScreen from '../../pages/app/Settings'
import {useNavigation} from '@react-navigation/native'
import AuthContext from '../../contexts/auth'
import SettingsHeaderRight from '../../components/headers/account/account-header_right'
import SettingsHeaderLeft from '../../components/headers/settings/settings-header_left'
import { useColorScheme } from 'react-native'

const SettingsStack = createStackNavigator()
 
export function SettingsNavigator() {

    const isDarkMode = useColorScheme() === 'dark'
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
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
                headerStyle: [HeaderStyle, {borderBottomWidth: 1, borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02}],
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
                headerLeft: () => <SettingsHeaderLeft/>
            }}
            
        />
         <SettingsStack.Screen
            name="Settings-Privacy"
            component={SettingsScreen}
            options={{
                headerTitle: 'Privacy',
                headerStyle: HeaderStyle,
                headerTintColor: String(ColorTheme().text),
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Notification"
            component={SettingsScreen}
            options={{
                headerTitle: 'Notification',
                headerStyle: HeaderStyle,
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Theme"
            component={SettingsScreen}
            options={{
                headerTitle: 'Theme',
                headerStyle: HeaderStyle,
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
        <SettingsStack.Screen
            name="Settings-Community_Guidelines"
            component={SettingsScreen}
            options={{
                headerTitle: 'Community Guidelines',
                headerStyle: HeaderStyle,
                cardStyle: {backgroundColor: String(ColorTheme().background)},
                cardOverlayEnabled: true,
            }}
        />
    </SettingsStack.Navigator>
  )
}