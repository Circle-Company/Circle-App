import React from 'react'
import { View } from 'react-native'
import sizes from '../../../layout/constants/sizes'

import { MemoryObjectProps } from '../../../components/memory/memory-types'
import { Memory } from '../../../components/memory'
import { Moment } from '../../../components/moment'
import { Text } from '../../../components/Themed'
import fonts from '../../../layout/constants/fonts'
type RenderMemoryProps = {
    memory: MemoryObjectProps,
    index: number,
    numOfMemories: number
}

export default function render_memory ({memory, index, numOfMemories}: RenderMemoryProps) {
    const container = {
        marginRight: 36
    } 
    const c0 = {
        zIndex: 3,
    }
    const c1 = {
        position: 'absolute',
        zIndex: 2,
        left: 35,
        transform: [ {scale: 0.8}],
    }
    const c2 = {
        position: 'absolute',
        zIndex: 1,
        left: 60,
        transform: [ {scale: 0.6}],
    }

    const text_container: any = {
        marginTop: sizes.margins['1sm']*0.7,
        alignItems: 'center'
    }
    const text_style = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold
    }

    
    
    return (
        <View style={container}>
            <Memory.MainRoot data={memory}>
                {memory.moments.map((moment, index) => {
                    const container = index == 0 && c0 || index == 1 && c1 || index == 2 && c2
                    return (
                        <Moment.Root.Main key={moment.id} data={moment} sizes={sizes.moment.tiny}>
                            <View style={container}>
                                <Memory.Container contentRender={moment.midia} focused={Boolean(index !==0)}>
                                    {index == 0 && 
                                        <Memory.CenterRoot>
                                            <Memory.Title/>
                                        </Memory.CenterRoot>                                       
                                    }
                                </Memory.Container>                            
                            </View>                            
                        </Moment.Root.Main>
                    )
                })}
                <View style={text_container}>
                    <Text style={text_style}>{memory.title}</Text>                    
                </View>

            </Memory.MainRoot>                   
        </View>
     

    )
}