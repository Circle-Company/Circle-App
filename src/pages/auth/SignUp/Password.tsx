import React, {useRef} from 'react';
import { StatusBar,  useColorScheme, Linking, Pressable} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import PasswordInput from '../../../components/auth/password_input'
import ButtonStandart from '../../../components/buttons/button-standart'
import Icon from '../../../assets/icons/svgs/plus_circle.svg'
import { useNavigation } from '@react-navigation/native'
import AuthContext from '../../../contexts/auth'
import AuthTermsText from '../../../components/auth/terms';

export default function PasswordScreen() {
    const isDarkMode = useColorScheme() === 'dark'
    const {passwordInput, signUp} = React.useContext(AuthContext)
    const navigation = useNavigation()

    const container = {
      flex: 1,
      alignItems: 'center'
    }

    const input_container = {
        alignItems: 'center',
        paddingTop: sizes.paddings['1xxl']* 0.6,
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
        color: passwordInput? colors.gray.white: isDarkMode? colors.gray.grey_04 + '90' : colors.gray.grey_04 + '90',
    }

    const icon: any = {
        marginLeft: sizes.margins['2sm'],
        top: 0.4
    }

    function handlePress() {
        if(passwordInput) {
            signUp()
        }
    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <View style={input_container}>
                <Text style={description}>You can't get it back if you forget it.</Text>
                <PasswordInput/>
            </View>
                <ButtonStandart
                    margins={false}
                    width={sizes.buttons.width/2.05}
                    height={40} 
                    action={handlePress}
                    backgroundColor={ passwordInput? ColorTheme().primary.toString() : ColorTheme().backgroundDisabled.toString()}
                >
                    <Text style={button_text}>Create Account</Text>
                    <Icon
                        style={icon}
                        fill={String(passwordInput? colors.gray.white: isDarkMode? colors.gray.grey_04 + '90' : colors.gray.grey_04 + '90')}
                        width={17}
                        height={17}
                    />
                </ButtonStandart>     

                <View style={{marginTop: sizes.margins['1xl'] * 0.8}}>
                  <AuthTermsText signText='"Create Account"'/> 
                </View>           

        </View>
    )
}