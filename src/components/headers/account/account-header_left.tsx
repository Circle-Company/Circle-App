import React from 'react'
import { Pressable, View, Text, Animated} from 'react-native'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import AuthContext from '../../../contexts/auth'

import { UserShow } from '../../user_show'
import fonts from '../../../layout/constants/fonts'

export default function AccountHeaderLeft() {
    const { user} = React.useContext(AuthContext)

    const container: any = {
        marginLeft: 8,
        flexDirection: 'row'
    }

    return(
        <View style={container}>
            <UserShow.Root data={user}>
                <UserShow.Username displayOnMoment={false} scale={1.3} fontFamily={fonts.family.Semibold} disableAnalytics={true}/>
            </UserShow.Root>
        </View>
    )
}