import React, {useRef} from 'react'
import { StatusBar,  useColorScheme, Linking, Pressable} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import AuthContext from '../../../contexts/auth'
import UsernameInput from '../../../components/auth/username_input'
import ButtonStandart from '../../../components/buttons/button-standart'
import Icon from '../../../assets/icons/svgs/arrow_circle_right.svg'
import { useNavigation } from '@react-navigation/native'
import PasswordInputSignIn from '../../../components/auth/password_input-sign_in'
import UsernameInputSignIn from '../../../components/auth/username_input-sign_in'
import AuthTermsText from '../../../components/auth/terms'

export default function SignInScreen() {
    const isDarkMode = useColorScheme() === 'dark'
    const {usernameInput, passwordInput, signIn} = React.useContext(AuthContext)
    const navigation = useNavigation()

    const container  = {
      marginTop: sizes.margins['1xxl'] * 0.9 ,
      flex: 1,
      alignItems: 'center',
    }

    const input_container = {
        alignItems: 'center',
        paddingBottom: sizes.paddings['1xl'] * 0.8
    }

    const description: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
        marginBottom: sizes.margins['1md']
    }

    const button_text: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: usernameInput && passwordInput? colors.gray.white: isDarkMode? colors.gray.grey_04 + '90' : colors.gray.grey_04 + '90',
    }

    const icon: any = {
        marginLeft: sizes.margins['2sm'],
        top: 0.4
    }

    function handlePress() {
        if(usernameInput && passwordInput) signIn()
    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <View style={input_container}>
              <View style={{marginBottom: sizes.margins['1md']}}>
                <UsernameInputSignIn/>
              </View>
                
                <PasswordInputSignIn/>
            </View>
            <ButtonStandart
                    margins={false}
                    width={sizes.buttons.width/2.7}
                    height={40} 
                    action={handlePress}
                    backgroundColor={ passwordInput && usernameInput? ColorTheme().primary.toString() : ColorTheme().backgroundDisabled.toString()}
                >
                    <Text style={button_text}>Enter Now</Text>
                    <Icon
                        style={icon}
                        fill={String(passwordInput && usernameInput? colors.gray.white: isDarkMode? colors.gray.grey_04 + '90' : colors.gray.grey_04 + '90')}
                        width={17}
                        height={17}
                    />
                </ButtonStandart>

                <View style={{marginTop: sizes.margins['1xl']}}>
                  <AuthTermsText signText='"Enter Now"'/> 
                </View>
                           

        </View>
    )
}