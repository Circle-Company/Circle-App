import React from 'react'
import { View } from 'react-native'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import ViewProfileContext from '../../../contexts/viewProfile'
import HeaderButton from '../headerButton'
import { UserShow } from '../../user_show'
import More from '../../../assets/icons/svgs/arrow_left.svg'
import sizes from '../../../layout/constants/sizes'

export default function ProfileHeaderLeft() {
    const { userProfile } = React.useContext(ViewProfileContext)
    const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row'
    }

    return(
        <View style={container}>
            <HeaderButton action={() => navigation.goBack()} marginLeft>
                <More fill={String(ColorTheme().text)} width={18} height={18}/>
            </HeaderButton>
            <View style={{marginLeft: sizes.margins['2sm']}}>
                <UserShow.Root data={userProfile}>
                    <UserShow.Username displayOnMoment={false} scale={1.3} disableAnalytics={true}/>
                </UserShow.Root>                
            </View>

        </View>
    )
}