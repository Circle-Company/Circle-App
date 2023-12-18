import React, {useRef, useState, useEffect, useCallback} from 'react'
import {View, ScrollView, Dimensions, NativeScrollEvent} from 'react-native'

import RenderMoment from './components/render-moment'
import sizes from '../../layout/constants/sizes'
import moments_data from '../../data/moment.json'
import { FlatList } from 'react-native-gesture-handler'
import { momentReciveDataProps } from '../../components/moment/moment-types'

export default function ListMoments () {
    const margin = 2
    const [centerIndex, setCenterIndex] = useState<number | null>(null);
    const flatListRef = useRef<FlatList | null>(null);
  
    const handleScroll = useCallback(
      (event: any) => {
        const screenWidth = Dimensions.get('window').width *0.9;
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const centerIndex = Math.floor(contentOffsetX / screenWidth);
        setCenterIndex(centerIndex);
      },
      [setCenterIndex]
    )
    const container_0 = {
        marginLeft: ((sizes.screens.width - sizes.moment.standart.width)/2) - margin ,
    }
    const container = {
        marginHorizontal: margin,
    }
    const container_1 = {
        marginRight: margin + (sizes.screens.width - sizes.moment.standart.width)/2,
    }

    const viewabilityConfig = {
        minimumViewTime: 3000,
        viewAreaCoveragePercentThreshold: 100,
        waitForInteraction: true,
      };

    return (
        <FlatList
            data={moments_data}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            viewabilityConfig={viewabilityConfig}
            scrollEventThrottle={16}
            snapToInterval={sizes.moment.standart.width+ margin}
            decelerationRate='fast'
            maxToRenderPerBatch={3}
            keyExtractor={(moment: any) => moment.id}
            disableIntervalMomentum={ true }
            ref={(ref) => {
                flatListRef.current = ref;
              }}
            renderItem={({item, index}) => {

                console.log(`moment: ${index} - focused: ${index === centerIndex}`)

                const focusedItem = index === 0? true: index === centerIndex || index -1 === centerIndex
                return (
                    <View style={index == 0? container_0: container && index +1 == moments_data.length? container_1: container}>
                        <RenderMoment moment={item} focused={focusedItem}/>
                    </View>
                )                              
            }}
            onScroll={handleScroll}
            directionalLockEnabled={true}
            >

        </FlatList>
    )
    
}