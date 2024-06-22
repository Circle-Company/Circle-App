import React from 'react'
import { Pressable, View } from 'react-native'
import sizes from '../../../layout/constants/sizes'
import MemoryContext from '../../../contexts/memory'
import { MemoryObjectProps } from '../../../components/memory/memory-types'
import { Memory } from '../../../components/memory'
import { Moment } from '../../../components/moment'
import { Text } from '../../../components/Themed'
import fonts from '../../../layout/constants/fonts'
import { useNavigation } from '@react-navigation/native'
import { truncated } from '../../../algorithms/processText'
import MemoryIcon from '../../../assets/icons/svgs/memory.svg'
import { colors } from '../../../layout/constants/colors'

type RenderMemoryProps = {
    memory: MemoryObjectProps,
    user_id: number
    pressable?: boolean
    scale?: number,
    marginRight?: number,
    textMarginTop?: number,
    fontSize?: number,
    dinamicMargin?: boolean,
    icon?: boolean
}

export default function render_memory ({
    memory,
    user_id,
    pressable = true,
    scale = 1,
    marginRight = 36,
    textMarginTop = sizes.margins['1sm']*0.7,
    fontSize = fonts.size.body,
    dinamicMargin = true,
    icon = false

}: RenderMemoryProps) {

    const {setMemory} = React.useContext(MemoryContext)
    const navigation = useNavigation()
    const container: any = {
        marginRight: dinamicMargin? memory.moments.length == 1 &&  marginRight - 23 * scale || memory.moments.length == 2 &&  marginRight - 5 * scale || memory.moments.length == 3 &&  marginRight + 5 * scale : marginRight,
    } 
    const c0 = {
        zIndex: 3,
        transform: [ {scale}],
    }
    const c1 = {
        position: 'absolute',
        zIndex: 2,
        left: 35 * scale,
        transform: [ {scale: 0.8 * scale}],
    }
    const c2 = {
        position: 'absolute',
        zIndex: 1,
        left: 60 * scale,
        transform: [ {scale: 0.6 * scale}],
        
    }

    const text_container: any = {
        marginTop: textMarginTop * scale,
        alignItems: 'center'
    }
    const text_style = {
        fontSize: fontSize * scale,
        fontFamily: fonts.family.Bold
    }
    const icon_container: any = {
        position: 'absolute',
        zIndex: 2,
        flex: 1,
        padding: sizes.paddings['2sm']
    }

    async function handlePressed(memoryData: any) {
        if(pressable) {
            setMemory({user_id, ...memoryData})
            navigation.navigate('MemoriesNavigator',{ screen: 'Memory'})
        }
    }

    return (
        <View style={container}>
            <Memory.MainRoot data={memory}>
                {memory.moments.map((moment, index) => {
                    const container: any = index == 0 && c0 || index == 1 && c1 || index == 2 && c2
                    return (
                        <Moment.Root.Main key={moment.id} momentData={moment} sizes={sizes.moment.tiny}>
                            <Pressable style={container} onPress={() => {handlePressed(memory)}}>
                                {icon &&
                                    <View style={icon_container}>
                                        <MemoryIcon fill={`${colors.gray.white}`} width={20} height={20}/>
                                    </View>
                                }
                                <Memory.Container contentRender={moment.midia} focused={Boolean(index !==0)}>
                                    {index == 0 && 
                                        <Memory.CenterRoot>
                                            <Memory.Title/>
                                        </Memory.CenterRoot>                                       
                                    }
                                </Memory.Container>                            
                            </Pressable>                            
                        </Moment.Root.Main>
                    )
                })}
                <View style={text_container}>
                    <Text style={text_style}>{truncated({text: memory.title, size: 12})}</Text>                    
                </View>
            </Memory.MainRoot>                   
        </View>
    )
}