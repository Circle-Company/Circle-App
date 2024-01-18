import React from 'react'
import { Pressable, View, Text, Animated} from 'react-native'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import AuthContext from '../../../contexts/auth'
import sizes from '../../../layout/constants/sizes'
import { UserShow } from '../../user_show'
import fonts from '../../../layout/constants/fonts'
import ProfileHeaderLeft from './profile-header_left'
import ProfileHeaderRight from './profile-header_right'

export default function ProfileHeader() {
    const { user} = React.useContext(AuthContext)

    const container: any = {
        ...sizes.headers,
        flexDirection: 'row'
    }
    const left_container: any = {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row'
    }
    const right_container: any = {
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row'
    }

    return(
        <View style={container}>
            <View style={left_container}>
                <ProfileHeaderLeft/>
            </View>
            <View style={right_container}>
                <ProfileHeaderRight/>
            </View>
        </View>
    )
}