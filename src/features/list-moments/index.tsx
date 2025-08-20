import React, { useCallback, useRef, useState } from "react"
import { Animated, RefreshControl, useColorScheme } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { Loading } from "@/components/loading"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import FeedContext from "@/contexts/Feed"
import RenderMomentFeed from "./components/feed/render-moment-feed"
import { EmptyList } from "./components/render-empty_list"

type ViewToken = {
    item: any
    key: string
    index: number | null
    isViewable: boolean
    section?: any
}

const ListMoments = () => {
    const margin = 2

    const {
        scrollEnabled: enableScrollFeed,
        feedData,
        reloadFeed,
        loading: loadingFeed,
        loadVideoFromCache,
        preloadNextVideo,
    } = React.useContext(FeedContext)
    const [centerIndex, setCenterIndex] = useState<number | null>(0)
    const [loading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const isDarkMode = useColorScheme() === "dark"
    const flatListRef = useRef<FlatList | null>(null)

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

    const handleScroll = useCallback(
        (event: any) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x + 140
            const newCenterIndex = Math.floor(
                (contentOffsetX + sizes.screens.width / 2) / (sizes.moment.standart.width + margin),
            )
            const validIndex = newCenterIndex >= 0 ? newCenterIndex : 0

            // Só atualizar se o índice mudou
            if (validIndex !== centerIndex && feedData[validIndex]) {
                setCenterIndex(validIndex)

                // Carregar vídeo do cache quando o usuário navegar manualmente
                const moment = feedData[validIndex]
                if (moment) {
                    loadVideoFromCache?.(moment.id)
                    // Fazer preload do próximo
                    preloadNextVideo?.(validIndex)
                }
            }
        },
        [setCenterIndex, centerIndex, feedData, loadVideoFromCache, preloadNextVideo],
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

    const handleRefresh = async () => {
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
            <FlatList
                data={feedData}
                horizontal
                scrollEnabled={enableScrollFeed}
                showsHorizontalScrollIndicator={false}
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={16}
                snapToInterval={sizes.moment.standart.width + margin}
                onViewableItemsChanged={onViewableItemsChanged.current}
                decelerationRate="fast"
                maxToRenderPerBatch={5} // Renderizar mais items para cache
                initialNumToRender={3} // Renderizar 3 inicialmente
                windowSize={7} // Manter 7 itens na memória
                removeClippedSubviews={true} // Remover views não visíveis
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
                            isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
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
                            <RenderMomentFeed
                                isFeed={true}
                                momentData={item}
                                isFocused={focusedItem}
                            />
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
