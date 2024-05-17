
import React from 'react'
import {View} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import ViewMorebutton from '../../buttons/view_more'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import NewMomentContext from '../../../contexts/newMoment'

export default function NewMomentImageRight() {

    const { selectedImage } = React.useContext(NewMomentContext)

    const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row',
        marginRight: sizes.margins['3sm'],
        opacity: selectedImage? 1 : 0.35
    }

    return(
        <View style={container}>
            <ViewMorebutton
                action={() => {selectedImage? navigation.navigate('MomentNavigator', { screen: 'NewMomentDescription'}): null}}
                text='Next' scale={1.2}
                fontFamily={selectedImage? fonts.family.Bold: fonts.family.Semibold }
            />
        </View>
    )
}