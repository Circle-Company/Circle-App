import React, {useRef} from 'react';
import { StatusBar,  useColorScheme, Button, Pressable} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import AuthContext from '../../../contexts/auth'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import PasswordInput from '../../../components/auth/password_input'
import ButtonStandart from '../../../components/buttons/button-standart'
import Icon from '../../../assets/icons/svgs/check_circle.svg'
import api from '../../../services/api'
import { useNavigation } from '@react-navigation/native'

export default function PasswordScreen({}) {
    const { passwordInput, user, setPasswordInput} = React.useContext(AuthContext)
    const isDarkMode = useColorScheme() === 'dark'
    const navigation = useNavigation()

    const container  = {
      alignItems:'center',
      flex: 1
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

    async function handlePress() {
        if(passwordInput) {
            try{
                await api.put('/auth/change-password', {
                    user_id: user.id,
                    password_input: passwordInput
                })      
                setPasswordInput('')
                navigation.goBack()
            }catch(err: any){
                console.log(err.message)
            }
        }
    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <View style={input_container}>
                <Text style={description}>You can't get it back if you forget it.</Text>
                <PasswordInput sign={false}/>
            </View>

            <ButtonStandart
                margins={false}
                width={sizes.buttons.width/3.5}
                height={40} 
                action={handlePress}
                backgroundColor={ passwordInput? ColorTheme().primary.toString() : ColorTheme().backgroundDisabled.toString()}
            >
                <Text style={button_text}>Done</Text>
                <Icon
                    style={icon}
                    fill={String(passwordInput? colors.gray.white: isDarkMode? colors.gray.grey_04 + '90' : colors.gray.grey_04 + '90')}
                    width={17}
                    height={17}
                    />
            </ButtonStandart>   
        </View>
    )
}