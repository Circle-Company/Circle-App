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
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
    INITIAL_PADDING,
    ITEM_WIDTH,
    SNAP_INTERVAL,
    SPACING,
} from "@/features/moments/feed-metrics"

// Altura da nav bar + uma folga curta abaixo do header (mesma convenção do
// módulo da câmera: 46 + 8). O espaço total reservado no topo = safe area do
// device + esta constante, adaptando a qualquer iPhone (SE, notch, Dynamic
// Island) em vez do multiplicador fixo `headers.height * 1.4`. Em Dynamic
// Island (insets.top ~59) dá ~113 ≈ o 112 que funcionava, e escala nos demais.
const NAV_BAR_HEIGHT = 54

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
    const insets = useSafeAreaInsets()
    // Espaço real do header = safe area do device (varia por aparelho) + nav bar.
    // Substitui o antigo `sizes.headers.height * 1.4` (número mágico que só
    // acertava num device específico).
    const topInset = insets.top + NAV_BAR_HEIGHT

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
        // Sem `cacheManager.clear()`: o cache expira sozinho por TTL (1h) e faz
        // eviction LRU. Limpar aqui apagava os vídeos que o perfil e a tela
        // cheia reaproveitariam, obrigando a baixar tudo de novo a cada
        // pull-to-refresh.
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
                style={{
                    flex: 1,
                    paddingTop: topInset,
                }}
                scrollEnabled={enableScrollFeed}
                // O input de comentário é filho desta lista. Com o padrão
                // ("never"), o primeiro toque com o teclado aberto só fecha o
                // teclado e é engolido — o botão de enviar nunca recebia o
                // onPress. "handled" entrega o toque a quem trata (o botão) e
                // mantém o fechamento do teclado ao tocar fora.
                keyboardShouldPersistTaps="handled"
                // iOS soma um content inset automático (safe area + header) por
                // cima do paddingTop, empurrando o vídeo pra baixo e cortando a
                // base. Desligar o ajuste automático deixa só o paddingTop valer.
                contentInsetAdjustmentBehavior="never"
                automaticallyAdjustContentInsets={false}
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
                contentContainerStyle={{
                    paddingHorizontal: INITIAL_PADDING,
                    alignItems: "flex-start",
                }}
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
                        outputRange: [0.9, 1, 0.9],
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
                            <Loading.ActivityIndicator size={40} color={colors.gray.grey_06} />
                        </Loading.Container>
                    )
                }}
            />
        )
    else
        return (
            <View
                style={{
                    alignItems: "center",
                    paddingTop: topInset,
                }}
            >
                <EmptyList />
            </View>
        )
}

export default ListMoments
