import React from 'react'
import { View } from 'react-native'
import AuthContext from '../../../contexts/auth'
import { UserShow } from '../../user_show'
import PersistedContext from '../../../contexts/Persisted'

export default function AccountHeaderLeft() {
    const { session } = React.useContext(PersistedContext)

    const container: any = {
        marginLeft: 8,
        flexDirection: 'row'
    }

    return(
        <View style={container}>
            <UserShow.Root data={session.user}>
                <UserShow.Username displayOnMoment={false} scale={1.3} disableAnalytics={true}/>
            </UserShow.Root>
        </View>
    )
}