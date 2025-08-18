import AgreeScreen from "@/pages/auth/SignUp/Agree"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import ColorTheme from "../../constants/colors"
import sizes from "../../constants/sizes"
import LanguageContext from "../../contexts/Preferences/language"
import SettingsCommunityGuidelines from "../../pages/app/Settings/CommunityGuidelines"
import SettingsPrivacyPolicy from "../../pages/app/Settings/PrivacyPolicy"
import SettingsTermsOfService from "../../pages/app/Settings/TermsOfService"
import LoginScreen from "../../pages/auth/SignIn"
import PasswordScreen from "../../pages/auth/SignUp/Password"
import UsernameScreen from "../../pages/auth/SignUp/Username"
import InitScreen from "../../pages/auth/Splash"
import { Interpolation as ModalPresentation } from "../transitions/modal-presentation"

const AuthStack = createStackNavigator()
export default function AuthNavigator() {
    const { t } = React.useContext(LanguageContext)

    const HeaderStyle = {
        ...sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    const CardStyle = {
        borderRadius: 40,
        backgroundColor: String(ColorTheme().background),
        paddingTop: sizes.paddings["1sm"],
    }
    return (
        <AuthStack.Navigator
            initialRouteName={"Init"}
            screenOptions={{
                presentation: "transparentModal", // <- IMPORTANTE
                cardOverlayEnabled: true,
            }}
        >
            <AuthStack.Screen name="Init" component={InitScreen} options={{ headerShown: false }} />
            <AuthStack.Screen
                name="Auth-SignIn"
                component={LoginScreen}
                options={{
                    headerShown: false,
                    cardStyle: CardStyle,
                    cardOverlayEnabled: true,
                    headerRight: () => null,
                    headerLeft: () => null,
                    cardStyleInterpolator: ModalPresentation,
                }}
            />
            <AuthStack.Screen
                name="Auth-SignUp-Username"
                component={UsernameScreen}
                options={{
                    headerShown: false,
                    cardStyle: CardStyle,
                    headerRight: () => null,
                    headerLeft: () => null,
                    cardStyleInterpolator: ModalPresentation,
                }}
            />
            <AuthStack.Screen
                name="Auth-SignUp-Password"
                component={PasswordScreen}
                options={{
                    headerShown: false,
                    cardStyle: CardStyle,
                    headerRight: () => null,
                    headerLeft: () => null,
                    cardStyleInterpolator: ModalPresentation,
                }}
            />
            <AuthStack.Screen
                name="Auth-SignUp-Agree"
                component={AgreeScreen}
                options={{
                    headerShown: false,
                    cardStyle: CardStyle,
                    headerRight: () => null,
                    headerLeft: () => null,
                    cardStyleInterpolator: ModalPresentation,
                }}
            />
            <AuthStack.Screen
                name="Auth-Privacy-Policy"
                component={SettingsPrivacyPolicy}
                options={{
                    headerTitle: t("Privacy Policy"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: CardStyle,
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: ModalPresentation,
                }}
            />
            <AuthStack.Screen
                name="Auth-Terms-Of-Service"
                component={SettingsTermsOfService}
                options={{
                    headerTitle: t("Terms of Service"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: CardStyle,
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: ModalPresentation,
                }}
            />
            <AuthStack.Screen
                name="Auth-Community-Guidelines"
                component={SettingsCommunityGuidelines}
                options={{
                    headerTitle: t("Community Guidelines"),
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: CardStyle,
                    cardOverlayEnabled: true,
                    cardStyleInterpolator: ModalPresentation,
                }}
            />
        </AuthStack.Navigator>
    )
}
