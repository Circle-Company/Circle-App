import { createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack'
import React from 'react'
import ColorTheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import Fonts from '../../layout/constants/fonts'
import AccountScreen from '../../pages/app/Account'
import {useNavigation} from '@react-navigation/native'
import AuthContext from '../../contexts/auth'
import AccountHeaderRight from '../../components/headers/account/account-header_right'
import AccountHeaderLeft from '../../components/headers/account/account-header_left'
import LanguageContext from '../../contexts/Preferences/language'
const AccountScreenStack = createStackNavigator()
 
export function AccountScreenNavigator() {
    const { t } = React.useContext(LanguageContext)
    const navigation = useNavigation()
    const HeaderStyle: any= {
        ...Sizes.headers,
        backgroundColor:  ColorTheme().background,
    }
   
  return (
    <AccountScreenStack.Navigator 
        screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}
    >
    <AccountScreenStack.Screen
        name="AccountScreen"
        component={AccountScreen}
        options={{
            headerTitleStyle: {display: 'none'},
            headerStyle: HeaderStyle,
            cardStyle: {backgroundColor: String(ColorTheme().background)},
            cardOverlayEnabled: true,
            headerRight: () => <AccountHeaderRight/>,
            headerLeft: () => <AccountHeaderLeft/>

        }}
    />
    <AccountScreenStack.Screen
        name="EditAccountScreen"
        component={AccountScreen}
        options={{
            headerTitle: t('Edit'),
            headerTitleAlign: 'left',
            headerTransparent: false,
            headerTitleStyle: {fontFamily: Fonts.family['Black-Italic'], fontSize: Fonts.size.title2},
            headerTintColor: String(ColorTheme().text),
            headerStyle: HeaderStyle,
            cardStyle: {backgroundColor: String(ColorTheme().background)},
            cardOverlayEnabled: true,
        }}
    />
    </AccountScreenStack.Navigator>
  )
}