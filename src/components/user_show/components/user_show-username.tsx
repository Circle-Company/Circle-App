import React from "react"
import { View, Text, Pressable, useColorScheme} from "react-native"

import Sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { UserUsernameProps } from "../user_show-types"
import { useUserShowContext } from "../user_show-context"
import { truncated } from "../../../algorithms/processText"
import { UserShowActions } from "../user_show-actions"

import Verifyed from '../../../assets/icons/svgs/check_circle_verify.svg'
import { useNavigation } from "@react-navigation/native"
import ViewProfileContext from "../../../contexts/viewProfile"
import MomentContext from "../../moment/context"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"

export default function user_username ({
    displayOnMoment = true,
    disableAnalytics = false,
    truncatedSize = 30,
    color = ColorTheme().text,
    fontSize = fonts.size.footnote,
    fontFamily = fonts.family.Bold,
    margin = Sizes.margins["1sm"],
    scale = 1
}: UserUsernameProps) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const {user, view_profile} = useUserShowContext()
    const {setProfile} = React.useContext(ViewProfileContext)
    const isDarkMode = useColorScheme() === 'dark'
    const navigation = useNavigation()

    const isMe = user.id == session.user.id? true : false

    const container:any = {
        margin: margin * scale,
        flexDirection: 'row',
        alignItems: 'center',
    }
    const username_style_moment:any = {
        fontSize: fontSize * scale,
        fontFamily,
        color: colors.gray.white,
        textShadowColor: '#00000070',
        textShadowOffset: { width: 0.3, height: 0.7 },
        textShadowRadius: 4,
    }

    const username_style:any = {
        fontSize: fontSize * scale,
        fontFamily,
        color,
    }

    async function onUsernameActions() {
        if(disableAnalytics == false || !isMe){
            UserShowActions.UsernamePressed({user_id: Number(user.id), action: view_profile, user})
            await setProfile(user.id)
            navigation.navigate('ProfileNavigator')
        }
        
    }
    
    return (
        <Pressable onPress={onUsernameActions} style={container}>
            <Text style={displayOnMoment? username_style_moment: username_style}>@{truncated({text: user.username, size: Number(truncatedSize)})}</Text>
            {user.verifyed && 
            <View style={{alignItems: 'center', justifyContent: "center", marginTop: 1 * scale*2, marginLeft: 2 * scale}}>
                <Verifyed fill={String(displayOnMoment? colors.gray.white: isDarkMode? colors.yellow.yellow_04: colors.yellow.yellow_05)} width={12 * scale} height={12 * scale}/>
            </View>
                               
            }
        </Pressable>
    )
}