
import React from 'react'
import {View, Text, useColorScheme} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import NewMomentContext from '../../../contexts/newMoment'
import AddIcon from '../../../assets/icons/svgs/memory.svg'
import { colors } from '../../../layout/constants/colors'
import ButtonStandart from '../../buttons/button-standart'
import { Loading } from '../../loading'

export default function NewMomentSelectMemoryRight() {

    const { allMemories, addToMemory} = React.useContext(NewMomentContext)
    const [ loading, setLoading ] = React.useState(false)
    const navigation = useNavigation()
    const isDarkMode = useColorScheme() ==='dark'

    const hasMemories = allMemories.length == 0? false : true

    const container: any = {
        flexDirection: 'row',
        marginRight: sizes.margins['3sm'],
    }

    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white
    }

    const textContainer: any = {
        marginRight: sizes.margins['2sm']
    }

    const loading_container: any = {
        marginLeft: sizes.margins['3sm'],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDarkMode? 0.6 : 1
    }

    const loading_text: any = {
        color: colors.gray.white,
        fontSize: fonts.size.caption1,
        flex: 1
    }

    async function handlePress() {
        if(!loading){
            setLoading(true)
            if(hasMemories) {
                await addToMemory()
                .then(function () {setLoading(false)})
                navigation.navigate('BottomTab', {screen: 'Moments'})
            }            
        }

    }

    return(
        <View style={container}>
            <ButtonStandart
                action={handlePress}
                width={sizes.buttons.width*0.31}
                backgroundColor={loading ? `${colors.blue.blue_05}40`:String(colors.blue.blue_05) }
            >
                {loading?
                        <View style={loading_container}>
                            <Text style={loading_text}>Loading</Text>
                            <Loading.Container width={40} height={30}>
                            <Loading.ActivityIndicator size={10}/>
                            </Loading.Container>                     
                        </View>

                : <>
                    <View style={textContainer}>
                    <Text style={text}>Create</Text>
                    </View>
                    <AddIcon fill={String(colors.gray.white)} width={15} height={15}/>                    
                </>}
            </ButtonStandart>  
        </View>
    )
}