import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Animated } from 'react-native'
import FastImage from 'react-native-fast-image'
import sizes from '../../layout/constants/sizes'
import { FlatList } from 'react-native-gesture-handler'
import { Loading } from '../../components/loading'
import RenderMoment from './components/render-moment'
import FeedContext from '../../contexts/Feed'
import {MomentProvider} from '../../components/moment/context'

const ListMoments = () => {
    const margin = 2

    const {enableScrollFeed, feedData} = React.useContext(FeedContext)
    const [centerIndex, setCenterIndex] = useState<number | null>(0);
    const flatListRef = useRef<FlatList | null>(null);

    const handleScroll = useCallback(
        (event: any) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x + 140
            const centerIndex = Math.floor((contentOffsetX + sizes.screens.width / 2) / (sizes.moment.standart.width + margin));
            setCenterIndex(centerIndex >= 0 ? centerIndex : 0);
        },
        [setCenterIndex]
    );

    const container_0 = {
        marginLeft: ((sizes.screens.width - sizes.moment.standart.width) / 2) - margin,
        marginRight: margin
    };
    const container = {
        marginRight: margin
    };
    const container_1 = {
        marginRight: margin + (sizes.screens.width - sizes.moment.standart.width) / 2,
    };

    const viewabilityConfig = {
        minimumViewTime: 3000,
        viewAreaCoveragePercentThreshold: 100,
        waitForInteraction: true
    };

    const prefetchNextImage = (index: number) => {
        const nextItem = feedData[index];
        if (nextItem && nextItem.midia.fullhd_resolution) {
            FastImage.preload([{ uri: nextItem.midia.fullhd_resolution.toString() }]);
        }
    };

    useEffect(() => {
        if (centerIndex !== null) {
            prefetchNextImage(centerIndex + 1);
        }
    }, [centerIndex]);

    return (
        <FlatList
            data={feedData}
            horizontal
            scrollEnabled={enableScrollFeed}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            viewabilityConfig={viewabilityConfig}
            scrollEventThrottle={16}
            snapToInterval={sizes.moment.standart.width + margin}
            decelerationRate='fast'
            maxToRenderPerBatch={3}
            keyExtractor={(moment: any) => moment.id.toString()}
            disableIntervalMomentum={true}
            onScroll={handleScroll}
            directionalLockEnabled={true}            
            ref={(ref) => { flatListRef.current = ref }}
            renderItem={({ item, index }) => {
                const focusedItem = index === centerIndex
                const container_style = index === 0 ? container_0 : index + 1 === feedData.length ? container_1 : container;
                return (
                    <Animated.View style={[container_style]} key={index}>
                    <RenderMoment isFeed={true} momentData={item} isFocused={focusedItem}/>
                    </Animated.View>
                )
            }}
            ListFooterComponent={() => (
                <Loading.Container height={sizes.moment.standart.height} width={sizes.moment.standart.width / 3.5}>
                    <Loading.ActivityIndicator size={40} />
                </Loading.Container>
            )}
        />
    );
};

export default ListMoments;
