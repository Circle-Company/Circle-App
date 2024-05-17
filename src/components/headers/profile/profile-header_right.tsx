import React from 'react'
import { View } from 'react-native'
import sizes from '../../../layout/constants/sizes'
import ViewProfileContext from '../../../contexts/viewProfile'
import { UserShow } from '../../user_show'

export default function ProfileHeaderRight() {
    const { userProfile } = React.useContext(ViewProfileContext)

    const container: any = {
        flexDirection: 'row',
        alignItems: 'center'
    }

    return(
        <View style={container}>
            <View style={{marginRight: sizes.margins['3sm']}}>
                <UserShow.Root data={userProfile}>
                    <UserShow.FollowButton isFollowing={userProfile.you_follow} hideOnFollowing={false} displayOnMoment={false}/>
                </UserShow.Root>                
            </View>
        </View>
    )
}