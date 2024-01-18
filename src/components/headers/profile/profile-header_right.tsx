import React from 'react'
import { Pressable, View, Text, Animated} from 'react-native'
import ColorTheme from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import HeaderButton from '../headerButton'
import AuthContext from '../../../contexts/auth'
import ViewProfileContext from '../../../contexts/viewProfile'
import { UserShow } from '../../user_show'

import More from '../../../assets/icons/svgs/ellipsis.svg'
import Edit from '../../../assets/icons/svgs/edit.svg'

export default function ProfileHeaderRight() {
    const { user } = React.useContext(ViewProfileContext)
    const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row',
        alignItems: 'center'
    }
    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text
    }

    const textContainer = {
        marginRight: sizes.margins['2sm']
    }

    return(
        <View style={container}>
            <View style={{marginRight: sizes.margins['2sm']}}>
                <UserShow.Root data={user}>
                    <UserShow.FollowButton isFollowing={user.you_follow} hideOnFollowing={false} displayOnMoment={false}/>
                </UserShow.Root>                
            </View>



            <HeaderButton action={() => navigation.navigate('SettingsNavigator')} marginRight>
                <More fill={String(ColorTheme().text)} width={18} height={18}/>
            </HeaderButton>
        </View>
    )
}