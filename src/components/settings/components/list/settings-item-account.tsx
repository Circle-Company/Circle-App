import { Pressable, View, useColorScheme} from "react-native"
import { SettingsiItemAccountObjectProps } from "../../settings-types"
import { Text } from "../../../Themed"
import { useNavigation } from "@react-navigation/native"
import sizes from "../../../../layout/constants/sizes"
import ColorTheme, { colors } from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import ChevronRight from '../../../../assets/icons/svgs/chevron_right.svg'
import { UserShow } from "../../../user_show"
import AuthContext from "../../../../contexts/auth"
import React from "react"
import TouchID from 'react-native-simple-biometrics'

export default function item ({
    name,
    value,
    type,
    navigator,
    navigateTo,
    secure
}: SettingsiItemAccountObjectProps) {

    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === 'dark'
    const {user} = React.useContext(AuthContext)

    const icon_fill: string = isDarkMode? String(colors.gray.grey_06): String(colors.gray.grey_03)

    const container: any = {
        width: sizes.screens.width,
        height: sizes.sizes["3md"],
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02
    }
    const container_left: any = {
        paddingLeft: sizes.paddings["1sm"],
        alignItems: 'flex-start',
    }    
    const container_right: any = {
        flexDirection: 'row',
        paddingRight: sizes.paddings["1md"] * 0.7,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    }
    const text_style: any = {
        textAlign: 'right',
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold
        
    }

    const value_container: any = {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: sizes.margins["2sm"]
        
    }

    const value_style: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }

    async function handlePress () {
        if(secure) {
            const isAuthenticated = await TouchID.requestBioAuth("make sure it's you", `You're deleting the selected Moments`)
            if (isAuthenticated) navigation.navigate('SettingsNavigator', {screen: navigateTo })
        } else navigation.navigate('SettingsNavigator', {screen: navigateTo })
    }

    return (
        <Pressable style={container} onPress={handlePress}>
            <View style={container_left}>
                <Text style={text_style}>{name}</Text>
            </View>
            <View style={container_right}>
                {type == 'IMAGE' ?
                    <View style={[value_container, {marginRight: 6}]}>
                        <UserShow.Root data={user}>
                            <UserShow.ProfilePicture displayOnMoment={false} pictureDimensions={{width: 22, height: 22}} disableAnalytics={true}/>
                        </UserShow.Root>                    
                    </View>

                    :
                    <View style={value_container}>
                      <Text style={value_style}>{value}</Text>  
                    </View>
                    
                }
                <View>
                    <ChevronRight fill={icon_fill} width={16} height={16}/>
                </View>
                
            </View>
        </Pressable>
    )
}