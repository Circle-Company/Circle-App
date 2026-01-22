import React, { useCallback, useRef, useState } from "react"
import { Animated } from "react-native"
import { Loading } from "@/components/loading"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import FeedContext from "@/contexts/Feed"
import RenderMomentFeed from "@/features/moments/feed/render-moment-feed"
import { EmptyList } from "@/features/moments/empty.list"
import PersistedContext from "@/contexts/Persisted"
import { View } from "react-native"

const ITEM_WIDTH = sizes.moment.standart.width
const SPACING = -20
const SNAP_INTERVAL = ITEM_WIDTH + SPACING
const INITIAL_PADDING = (sizes.screens.width - ITEM_WIDTH) / 2

type ViewToken = {
    item: any
    key: string
    index: number | null
    isViewable: boolean
    section?: any
}

const ListMoments = () => {
    const {
        scrollEnabled: enableScrollFeed,
        feedData,
        reloadFeed,
        loading: loadingFeed,
        loadVideoFromCache,
        preloadNextVideo,
        fetch,
        setCommentEnabled,
        cacheManager,
    } = React.useContext(FeedContext)
    const [centerIndex, setCenterIndex] = useState<number | null>(0)
    const [loading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const flatListRef = useRef<Animated.FlatList<any> | null>(null)
    const { session } = React.useContext(PersistedContext)
    const scrollX = useRef(new Animated.Value(0)).current

    // Criar referência para onViewableItemsChanged
    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            const visibleItem = viewableItems[0]
            if (visibleItem && visibleItem.index !== null) {
                const momentId = visibleItem.item.id
                const currentIndex = visibleItem.index

                // Carregar vídeo do cache quando ficar visível
                loadVideoFromCache?.(momentId)

                // Fazer preload do próximo vídeo
                preloadNextVideo?.(currentIndex)

                console.log(`Momento focado: ${momentId}, índice: ${currentIndex}`)
            }
        }
    })

    const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: true,
        listener: (event: any) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x
            const newCenterIndex = Math.round(contentOffsetX / SNAP_INTERVAL)
            const validIndex = Math.max(0, Math.min(newCenterIndex, feedData.length - 1))

            if (validIndex !== centerIndex && feedData[validIndex]) {
                setCenterIndex(validIndex)
                const moment = feedData[validIndex]
                if (moment) {
                    loadVideoFromCache?.(moment.id)
                    setCommentEnabled(false)
                    preloadNextVideo?.(validIndex)
                }
            }
        },
    })

    const viewabilityConfig = {
        minimumViewTime: 3000,
        viewAreaCoveragePercentThreshold: 10,
        waitForInteraction: false,
    }

    const handleRefresh = async () => {
        await fetch()
        cacheManager?.clear()
        if (flatListRef.current) flatListRef.current.scrollToOffset({ animated: false, offset: 0 })
        await reloadFeed().finally(() => {
            setTimeout(() => {
                setRefreshing(false)
            }, 200)
        })
    }

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
            <Animated.FlatList
                data={feedData}
                horizontal
                style={{ paddingTop: sizes.headers.height * 1.4 }}
                scrollEnabled={enableScrollFeed}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                alwaysBounceVertical={true}
                alwaysBounceHorizontal={true}
                overScrollMode="never"
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={16}
                snapToInterval={SNAP_INTERVAL}
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: INITIAL_PADDING }}
                getItemLayout={(_, index) => ({
                    length: SNAP_INTERVAL,
                    offset: index * SNAP_INTERVAL,
                    index,
                })}
                onViewableItemsChanged={onViewableItemsChanged.current}
                decelerationRate="fast"
                maxToRenderPerBatch={5} // Renderizar mais items para cache
                initialNumToRender={3} // Renderizar 3 inicialmente
                windowSize={10} // Manter 7 itens na memória
                removeClippedSubviews={true} // Remover views não visíveis
                keyExtractor={(moment: any) => moment.id.toString()}
                disableIntervalMomentum={true}
                onScroll={handleScroll}
                directionalLockEnabled={true}
                contentOffset={{ x: 0, y: 0 }}
                onEndReached={async () => await fetch()}
                onEndReachedThreshold={0}
                refreshing={refreshing}
                onRefresh={async () => await handleRefresh()}
                ref={(ref) => {
                    flatListRef.current = ref
                }}
                renderItem={({ item, index }) => {
                    const focusedItem = index === centerIndex
                    const scrollPosition = index * SNAP_INTERVAL

                    const inputRange = [
                        scrollPosition - SNAP_INTERVAL,
                        scrollPosition,
                        scrollPosition + SNAP_INTERVAL,
                    ]

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.85, 1, 0.85],
                        extrapolate: "clamp",
                    })

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.95, 1, 0.95],
                        extrapolate: "clamp",
                    })

                    return (
                        <Animated.View
                            style={{
                                width: ITEM_WIDTH,
                                marginRight: SPACING,
                                transform: [{ scale }],
                                opacity,
                            }}
                            key={item.id}
                        >
                            <RenderMomentFeed
                                isMe={item.user.id === session.user.id}
                                isFeed={true}
                                data={item}
                                isFocused={focusedItem}
                            />
                        </Animated.View>
                    )
                }}
                ListFooterComponent={() => {
                    return (
                        <Loading.Container
                            height={sizes.moment.standart.height}
                            width={sizes.moment.standart.width / 2.5}
                        >
                            <View style={{ transform: [{ scale: 1.5 }] }}>
                                <Loading.ActivityIndicator size={80} color={colors.gray.grey_06} />
                            </View>
                        </Loading.Container>
                    )
                }}
            />
        )
    else return <EmptyList />
}

export default ListMoments
