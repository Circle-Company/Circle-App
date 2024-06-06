
import React from 'react'
import {View} from 'react-native'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import HeaderButton from '../headerButton'
import ArrowLeft from '../../../assets/icons/svgs/close.svg'
import ViewMorebutton from '../../buttons/view_more'
import fonts from '../../../layout/constants/fonts'
import { t } from 'i18next'
import sizes from '../../../layout/constants/sizes'
import PersistedContext from '../../../contexts/Persisted'

export default function MemoriesListMomentsHeaderRight({user_id}: {user_id: number}) {
    const { session } = React.useContext(PersistedContext)
    const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row',
        marginRight: sizes.margins['3sm']
    }

    if(user_id == session.user.id) return(
        <View style={container}>
            <ViewMorebutton
                action={() => {navigation.navigate('MemoriesNavigator', { screen: 'EditMemory'})}}
                text={t('Edit')}
                scale={1.2}
                fontFamily={fonts .family.Semibold}
            />
        </View>
    )
    else return null
}