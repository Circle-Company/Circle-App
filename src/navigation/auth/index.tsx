import { createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack'
import React from 'react'
import InitScreen from '../../pages/auth/Splash'
import LoginScreen from '../../pages/auth/SignIn'
import ColorTheme from '../../layout/constants/colors'
import sizes from '../../layout/constants/sizes'
import fonts from '../../layout/constants/fonts'
import UsernameScreen from '../../pages/auth/SignUp/Username'
import PasswordScreen from '../../pages/auth/SignUp/Password'
import LanguageContext from '../../contexts/Preferences/language'
import SettingsPrivacyPolicy from '../../pages/app/Settings/PrivacyPolicy'
import SettingsTermsOfService from '../../pages/app/Settings/TermsOfService'
import SettingsCommunityGuidelines from '../../pages/app/Settings/CommunityGuidelines'

const AuthStack = createStackNavigator();
export default function AuthNavigator(){

    const { t } = React.useContext(LanguageContext)

    const HeaderStyle: any= {
        ...sizes.headers,
        backgroundColor:  ColorTheme().background,
    }

    const CardStyle: any = {
        backgroundColor: String(ColorTheme().background),
        paddingTop: sizes.paddings['1lg']
    }
    return(
        <AuthStack.Navigator initialRouteName={'Init'} screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS}}>
            <AuthStack.Screen
                name="Init"
                component={InitScreen}
                options={{ headerShown: false }}
            />
            <AuthStack.Screen
                name="Auth-SignIn"
                component={LoginScreen}
                options={{
                    headerTitle: 'Wellcome Back',
                    headerTitleAlign: 'center',
                    headerTransparent: false,
                    headerTitleStyle: {fontFamily: fonts.family['Black-Italic'], fontSize: fonts.size.title2},
                    headerTintColor: String(ColorTheme().text),
                    headerStyle: HeaderStyle,
                    cardStyle: CardStyle,
                    cardOverlayEnabled: true,
                    headerRight: () => null,
                    headerLeft: () => null

                }}
            />
            <AuthStack.Screen
                name="Auth-SignUp-Username"
                component={UsernameScreen}
                options={{
                    headerTitle: 'Chose a Username',
                    headerTitleAlign: 'center',
                    headerTransparent: false,
                    headerTitleStyle: {fontFamily: fonts.family['Bold-Italic'], fontSize: fonts.size.title2},
                    headerTintColor: String(ColorTheme().text),
                    headerStyle: HeaderStyle,
                    cardStyle: CardStyle,
                    headerRight: () => null,
                    headerLeft: () => null

                }}
            />
            <AuthStack.Screen
                name="Auth-SignUp-Password"
                component={PasswordScreen}
                options={{
                    headerTitle: 'Create a Password',
                    headerTitleAlign: 'center',
                    headerTransparent: false,
                    headerTitleStyle: {fontFamily: fonts.family['Bold-Italic'], fontSize: fonts.size.title2},
                    headerTintColor: String(ColorTheme().text),
                    headerStyle: HeaderStyle,
                    cardStyle: CardStyle,
                    cardOverlayEnabled: true,
                    headerRight: () => null,
                    headerLeft: () => null

                }}
            />
            <AuthStack.Screen
                name="Auth-Privacy-Policy"
                component={SettingsPrivacyPolicy}
                options={{
                    headerTitle: t('Privacy Policy'),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    cardOverlayEnabled: true,
                }}
            />
            <AuthStack.Screen
                name="Auth-Terms-Of-Service"
                component={SettingsTermsOfService}
                options={{
                    headerTitle: t('Terms of Service'),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    cardOverlayEnabled: true,
                }}
            />
            <AuthStack.Screen
                name="Auth-Community-Guidelines"
                component={SettingsCommunityGuidelines}
                options={{
                    headerTitle: t('Community Guidelines'),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: {backgroundColor: String(ColorTheme().background)},
                    cardOverlayEnabled: true,
                }}
            />
        </AuthStack.Navigator>
    )
}