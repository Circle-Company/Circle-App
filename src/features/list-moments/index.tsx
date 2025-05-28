import { Animated, RefreshControl, useColorScheme } from "react-native"
import React, { useCallback, useEffect, useRef, useState } from "react"

import { EmptyList } from "./components/render-empty_list"
import FastImage from "react-native-fast-image"
import FeedContext from "../../contexts/Feed"
import { FlatList } from "react-native-gesture-handler"
import { Loading } from "../../components/loading"
import RenderMomentFeed from "./components/feed/render-moment-feed"
import { colors } from "../../layout/constants/colors"
import sizes from "../../layout/constants/sizes"

const ListMoments = () => {
    const margin = 2

    const {
        scrollEnabled: enableScrollFeed,
        feedData,
        reloadFeed,
        loading: loadingFeed,
    } = React.useContext(FeedContext)
    const [centerIndex, setCenterIndex] = useState<number | null>(0)
    const [loading, setLoading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const isDarkMode = useColorScheme() === "dark"
    const flatListRef = useRef<FlatList | null>(null)

    const handleScroll = useCallback(
        (event: any) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x + 140
            const centerIndex = Math.floor(
                (contentOffsetX + sizes.screens.width / 2) / (sizes.moment.standart.width + margin)
            )
            setCenterIndex(centerIndex >= 0 ? centerIndex : 0)
        },
        [setCenterIndex]
    )

    const container_0 = {
        marginLeft: (sizes.screens.width - sizes.moment.standart.width) / 2 - margin,
        marginRight: margin,
    }
    const container = {
        marginRight: margin,
    }
    const container_1 = {
        marginRight: margin + (sizes.screens.width - sizes.moment.standart.width) / 2,
    }

    const viewabilityConfig = {
        minimumViewTime: 3000,
        viewAreaCoveragePercentThreshold: 10,
        waitForInteraction: false,
    }

    const prefetchNextImage = (index: number) => {
        const nextItem = feedData[index]
        if (nextItem && nextItem?.midia?.fullhd_resolution) {
            FastImage.preload([{ uri: nextItem?.midia?.fullhd_resolution.toString() }])
        }
    }

    const handleRefresh = async () => {
        if (flatListRef.current) flatListRef.current.scrollToOffset({ animated: false, offset: 0 })
        await reloadFeed().finally(() => {
            setTimeout(() => {
                setRefreshing(false)
            }, 200)
        })
    }

    useEffect(() => {
        if (centerIndex !== null) {
            prefetchNextImage(centerIndex + 1)
        }
    }, [centerIndex])

    if (loading)
        return (
            <Loading.Container
                width={sizes.screens.width}
                height={sizes.screens.height - sizes.headers.height}
            >
                <Loading.ActivityIndicator />
            </Loading.Container>
        )

    if (feedData.length > 0)
        return (
            <FlatList
                data={feedData}
                horizontal
                scrollEnabled={enableScrollFeed}
                showsHorizontalScrollIndicator={false}
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={16}
                snapToInterval={sizes.moment.standart.width + margin}
                decelerationRate="fast"
                maxToRenderPerBatch={3}
                keyExtractor={(moment: any) => moment.id.toString()}
                disableIntervalMomentum={true}
                onScroll={handleScroll}
                directionalLockEnabled={true}
                onEndReached={async () => {
                    await reloadFeed()
                }}
                onEndReachedThreshold={0}
                refreshControl={
                    <RefreshControl
                        progressBackgroundColor={String(
                            isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02
                        )}
                        colors={[
                            String(isDarkMode ? colors.gray.grey_04 : colors.gray.grey_04),
                            "#00000000",
                        ]}
                        refreshing={refreshing}
                        onRefresh={async () => await handleRefresh()}
                    />
                }
                ref={(ref) => {
                    flatListRef.current = ref
                }}
                renderItem={({ item, index }) => {
                    const focusedItem = index === centerIndex
                    const container_style =
                        index === 0
                            ? container_0
                            : index + 1 === feedData.length
                                ? container_1
                                : container

                    return (
                        <Animated.View style={container_style} key={item.unique_id}>
                            <RenderMomentFeed isFeed={true} momentData={item} isFocused={focusedItem} />
                        </Animated.View>
                    )
                }}
                ListFooterComponent={() => {
                    if (loadingFeed)
                        return (
                            <Loading.Container
                                height={sizes.moment.standart.height}
                                width={sizes.moment.standart.width / 3.5}
                            >
                                <Loading.ActivityIndicator size={40} />
                            </Loading.Container>
                        )
                }}
            />
        )
    else return <EmptyList />
}

export default ListMoments
