
import React from 'react'
import {View} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import ViewMorebutton from '../../buttons/view_more'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import SelectMomentsContext from '../../../contexts/selectMoments'
import LanguageContext from '../../../contexts/Preferences/language'

export default function MemoryHeaderRight() {
    const {t} = React.useContext(LanguageContext)
    const { selectedMoments } = React.useContext(SelectMomentsContext)
    const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row',
        marginRight: sizes.margins['3sm'],
        opacity: selectedMoments.length> 0? 1 : 0.35
    }

    return(
        <View style={container}>
            <ViewMorebutton
                action={() => {selectedMoments.length> 0? navigation.navigate('MemoriesNavigator', { screen: 'NewMemoryTitle'}): null}}
                text={t('Next')}
                scale={1.2}
                fontFamily={selectedMoments.length> 0? fonts.family.Bold: fonts.family.Semibold }
            />
        </View>
    )
}