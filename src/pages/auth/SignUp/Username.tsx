import React, {useRef} from 'react'
import { StatusBar,  useColorScheme, Linking, Pressable} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import AuthContext from '../../../contexts/auth'
import UsernameInput from '../../../components/auth/username_input'
import ButtonStandart from '../../../components/buttons/button-standart'
import NextIcon from '../../../assets/icons/svgs/arrow_circle_right.svg'
import { useNavigation } from '@react-navigation/native'

export default function UsernameScreen() {
    const isDarkMode = useColorScheme() === 'dark'
    const { signInputUsername } = React.useContext(AuthContext)
    const navigation = useNavigation()

    const container  = {
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
        color: signInputUsername? colors.gray.white: isDarkMode? colors.gray.grey_04 + '90' : colors.gray.grey_04 + '90',
    }

    const icon: any = {
        marginLeft: sizes.margins['2sm'],
        top: 0.4
    }

    function handlePress() {
        if(signInputUsername) {
            navigation.navigate('Auth-SignUp-Password')
        }
    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <View style={input_container}>
                <Text style={description}>You can't change it later.</Text>
                <UsernameInput/>
            </View>
                <ButtonStandart
                    margins={false}
                    width={sizes.buttons.width/2.8}
                    height={40} 
                    action={handlePress}
                    backgroundColor={ signInputUsername? ColorTheme().primary.toString() : ColorTheme().backgroundDisabled.toString()}
                >
                    <Text style={button_text}>Next Step</Text>
                    <NextIcon
                        style={icon}
                        fill={String(signInputUsername? colors.gray.white: isDarkMode? colors.gray.grey_04 + '90' : colors.gray.grey_04 + '90')}
                        width={17}
                        height={17}
                    />
                </ButtonStandart>                

        </View>
    )
}