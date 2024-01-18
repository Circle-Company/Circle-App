import React from 'react'
import { FlatList, View, Dimensions} from 'react-native'
import sizes from '../../../layout/constants/sizes'
import { RenderMemoryMoment } from './components/render-memory_moment'
import { Loading } from '../../../components/loading'
import memory_moments_data from '../../../data/memory-moments.json'
import { colors } from '../../../layout/constants/colors'

export default function ListMemoryMoments() {
    const margin = 20
    const [centerIndex, setCenterIndex] = React.useState<number | null>(null);
    const flatListRef = React.useRef<FlatList | null>(null);

    const handleScroll = React.useCallback(
      (event: any) => {
        const screenWidth = Dimensions.get('window').width * 0.9;
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const centerIndex = Math.floor(contentOffsetX / screenWidth);
        setCenterIndex(centerIndex);
      },
      [setCenterIndex]
    )
    const container_0 = {
        marginLeft: ((sizes.screens.width - sizes.moment.small.width + margin*2)/2) - margin ,
        marginRight: margin,
    }
    const container = {
        marginRight: margin,
    }
    const container_1 = {
        
     }

    const viewabilityConfig = {
        minimumViewTime: 3000,
        viewAreaCoveragePercentThreshold: 100,
        waitForInteraction: true,
    };
    return (
        <FlatList
        data={memory_moments_data.moments}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        snapToInterval={sizes.moment.small.width+ margin}
        decelerationRate='fast'
        maxToRenderPerBatch={3}
        keyExtractor={(moment: any) => moment.id}
        disableIntervalMomentum={ true }
        ref={(ref) => { flatListRef.current = ref }}
        renderItem={({item, index}) => {
            const viewedItem =  index === centerIndex 
            return (
                <View style={index == 0? container_0: container && index +1 == memory_moments_data.moments.length? container_1: container}>
                    <RenderMemoryMoment moment={item} viewed={viewedItem}/>
                </View>
            )                              
        }}
        onScroll={handleScroll}
        directionalLockEnabled={true}
        ListFooterComponent={() => {
            return (
                    <Loading.Container height={sizes.moment.standart.height} width={sizes.moment.standart.width/3}>
                        <Loading.ActivityIndicator
                            interval={10}
                            size={40}
                            from_color={String(colors.gray.grey_09)}
                            to_color={String(colors.gray.grey_07)}
                        />
                    </Loading.Container>               
            )
        }}
    />
    )
}