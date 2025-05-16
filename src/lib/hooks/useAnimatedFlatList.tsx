import React from "react"
import { PanResponder, View, useColorScheme } from "react-native"
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    withRepeat,
    Easing,
} from "react-native-reanimated"
import { Text } from "../../components/Themed"
import { Loading } from "../../components/loading"
import config from "../../config"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"
import { Vibrate } from "./useHapticFeedback"

type AnimatedFlatlistProps<T> = {
    data: Array<T>
    isLoading?: boolean
    skeleton?: React.ReactElement
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement
    ListFooterComponent: () => React.ReactElement
    ListHeaderComponent?: () => React.ReactElement
    ListEmptyComponent?: () => React.ReactElement
    onEndReachedThreshold: number
    showRefreshSpinner?: boolean
    endRefreshAnimationDelay?: number
    disableVibrate?: boolean
    onEndReached: () => Promise<void>
    handleRefresh: () => void
    CustomRefreshIcon?: React.ComponentType
}

const DefaultEmptyComponent = () => (
    <View
        style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: sizes.paddings["2md"],
            backgroundColor: "transparent",
            opacity: 0.8,
        }}
    >
        <Text
            style={{
                fontSize: fonts.size.body,
                color: colors.gray.grey_04,
                textAlign: "center",
                fontFamily: fonts.family.Medium,
            }}
        >
            Nenhum item encontrado
        </Text>
    </View>
)

// Componente de item animado
const AnimatedListItem = React.memo(
    ({
        item,
        index,
        renderItem,
        elasticDistortion,
    }: {
        item: any
        index: number
        renderItem: ({ item, index }: { item: any; index: number }) => React.ReactElement
        elasticDistortion: Animated.SharedValue<number>
    }) => {
        const itemStyle = useAnimatedStyle(() => {
            "worklet"
            // Calcula a distorção baseada na posição do item
            const distortionFactor = interpolate(
                index,
                [0, 5], // Aplica o efeito nos primeiros 5 itens
                [1, 0.1], // O primeiro item é mais afetado, o efeito diminui gradualmente
                { extrapolateRight: "clamp" }
            )

            // Aplica a distorção vertical
            const scaleY = 1 + (elasticDistortion.value * distortionFactor) / 100

            return {
                transform: [
                    { scaleY },
                    // Adiciona um leve deslocamento vertical para reforçar o efeito
                    { translateY: elasticDistortion.value * distortionFactor * 0.5 },
                ],
                // Ajusta a opacidade para dar mais profundidade ao efeito
                opacity: interpolate(elasticDistortion.value, [0, 50], [1, 0.95], {
                    extrapolateRight: "clamp",
                }),
            }
        })

        return <Animated.View style={itemStyle}>{renderItem({ item, index })}</Animated.View>
    }
)

export function AnimatedVerticalFlatlist<T>({
    data,
    renderItem,
    isLoading,
    ListFooterComponent,
    ListHeaderComponent,
    skeleton,
    onEndReached,
    handleRefresh,
    disableVibrate = false,
    showRefreshSpinner = true,
    endRefreshAnimationDelay = 200,
    onEndReachedThreshold,
    CustomRefreshIcon,
    ListEmptyComponent = DefaultEmptyComponent,
}: AnimatedFlatlistProps<T>) {
    const isDarkMode = useColorScheme() === "dark"
    const scrollPosition = useSharedValue(0)
    const pullDownPosition = useSharedValue(0)
    const isReadyToRefresh = useSharedValue(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [isScrolling, setIsScrolling] = React.useState(false)
    const rotation = useSharedValue(0)

    const gradientColors = useSharedValue({
        startColor: "rgba(50, 0, 255, 0)",
        endColor: "rgba(50, 0, 0, 0)",
    })

    const elasticDistortion = useSharedValue(0)

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            "worklet"
            scrollPosition.value = event.contentOffset.y

            // Calcula a distorção elástica quando o scroll é negativo (tentando rolar para cima além do topo)
            if (event.contentOffset.y < 0) {
                // Aplica uma resistência não-linear para o efeito elástico
                const overscroll = -event.contentOffset.y
                elasticDistortion.value = Math.min(overscroll * 0.3, 50) // Limita a distorção máxima
            } else {
                elasticDistortion.value = withSpring(0, {
                    damping: 20,
                    stiffness: 90,
                    mass: 0.8,
                    velocity: 0.1,
                })
            }

            // Ajusta a intensidade do gradiente para ser mais suave
            const scrollIntensity = Math.min(1, event.contentOffset.y / 200)
            gradientColors.value = {
                startColor: `rgba(0, 0, 255, ${scrollIntensity * 0.7})`,
                endColor: `rgba(0, 0, 0, ${scrollIntensity * 0.7})`,
            }
            runOnJS(setIsScrolling)(true)
        },
        onMomentumEnd: () => {
            "worklet"
            runOnJS(setIsScrolling)(false)
            // Reseta a distorção elástica quando o momentum termina
            elasticDistortion.value = withSpring(0, {
                damping: 20,
                stiffness: 90,
                mass: 0.8,
                velocity: 0.1,
            })
        },
    })

    const onRefresh = React.useCallback(() => {
        setRefreshing(true)
        handleRefresh()
        if (!disableVibrate) Vibrate("effectTick")
        setTimeout(() => {
            setRefreshing(false)
            pullDownPosition.value = withSpring(0, {
                damping: 20,
                stiffness: 90,
                mass: 0.8,
                velocity: 0.1,
            })
        }, endRefreshAnimationDelay)
    }, [handleRefresh, disableVibrate, endRefreshAnimationDelay])

    const pullDownStyles = useAnimatedStyle(() => {
        "worklet"
        return {
            transform: [{ translateY: pullDownPosition.value }],
            opacity: interpolate(pullDownPosition.value, [0, 25, 50, 75], [0.3, 0.5, 0.7, 0.9], {
                extrapolateRight: "clamp",
            }),
        }
    })

    const onPanRelease = React.useCallback(() => {
        if (isReadyToRefresh.value) {
            if (!disableVibrate) Vibrate("effectTick")
            pullDownPosition.value = withSpring(75, {
                damping: 20,
                stiffness: 90,
                mass: 0.8,
                velocity: 0.1,
            })
            isReadyToRefresh.value = false
            runOnJS(onRefresh)()
        } else {
            pullDownPosition.value = withSpring(0, {
                damping: 20,
                stiffness: 90,
                mass: 0.8,
                velocity: 0.1,
            })
        }
    }, [isReadyToRefresh, disableVibrate, onRefresh])

    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: (_, gestureState) =>
                    scrollPosition.value <= 0 && gestureState.dy > 0,
                onMoveShouldSetPanResponder: (_, gestureState) =>
                    scrollPosition.value <= 0 && gestureState.dy > 0,
                onPanResponderMove: (_, gestureState) => {
                    "worklet"
                    const maxDistance = 150
                    const resistance = 0.6
                    const newPosition = Math.min(
                        maxDistance,
                        Math.max(0, gestureState.dy * resistance)
                    )

                    pullDownPosition.value = newPosition
                    isReadyToRefresh.value = newPosition > 75
                },
                onPanResponderRelease: () => runOnJS(onPanRelease)(),
                onPanResponderTerminate: () => {
                    "worklet"
                    pullDownPosition.value = withSpring(0, {
                        damping: 20,
                        stiffness: 90,
                        mass: 0.8,
                        velocity: 0.1,
                    })
                },
            }),
        [scrollPosition.value, onPanRelease]
    )

    // Atualiza o valor de rotação quando refreshing muda
    React.useEffect(() => {
        if (refreshing) {
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 1000,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }),
                -1, // loop infinito
                false // não reverte
            )
        } else {
            rotation.value = withTiming(0, {
                duration: 300,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            })
        }
    }, [refreshing])

    const refreshIconStyles = useAnimatedStyle(() => {
        "worklet"
        const pullRotation = interpolate(
            pullDownPosition.value,
            [0, 75],
            [0, 720], // 2 voltas completas
            { extrapolateRight: "clamp" }
        )

        return {
            opacity: refreshing
                ? 0.8
                : interpolate(pullDownPosition.value, [0, 25, 50, 75], [0.2, 0.4, 0.7, 1], {
                    extrapolateRight: "clamp",
                }),
            transform: [
                {
                    scale: refreshing
                        ? 1
                        : interpolate(
                            pullDownPosition.value,
                            [0, 25, 50, 75],
                            [0.5, 0.65, 0.85, 1],
                            { extrapolateRight: "clamp" }
                        ),
                },
                {
                    rotate: refreshing ? `${rotation.value}deg` : `${pullRotation}deg`,
                },
            ],
        }
    })

    const loadingAnimationStyle = useAnimatedStyle(() => {
        "worklet"
        return {
            opacity: withTiming(refreshing ? 1 : 0, {
                duration: 300,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            transform: [
                {
                    scale: withTiming(refreshing ? 1 : 0.5, {
                        duration: 300,
                        easing: Easing.bezier(0.4, 0, 0.2, 1),
                    }),
                },
            ],
        }
    })

    const animatedFlatlistStyles = useAnimatedStyle(() => {
        "worklet"
        const borderRadius = interpolate(
            pullDownPosition.value,
            [0, 50, 100, 150],
            [0, 5, 12, 20],
            { extrapolateRight: "clamp" }
        )
        return {
            transform: [{ translateY: pullDownPosition.value }],
            borderRadius,
            overflow: "hidden",
            opacity: withTiming(isScrolling ? 0.98 : 1, {
                duration: 200,
            }),
        }
    })

    // Função para renderizar o item com efeito elástico
    const renderItemWithElasticEffect = React.useCallback(
        ({ item, index }: { item: T; index: number }) => (
            <AnimatedListItem
                item={item}
                index={index}
                renderItem={renderItem}
                elasticDistortion={elasticDistortion}
            />
        ),
        [renderItem, elasticDistortion]
    )

    return (
        <View
            pointerEvents={refreshing ? "none" : "auto"}
            style={{
                backgroundColor: ColorTheme().backgroundDisabled + "70",
                flex: 1,
            }}
        >
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        top: -50,
                        width: "100%",
                        alignItems: "center",
                        zIndex: 1,
                    },
                    pullDownStyles,
                ]}
            >
                <Animated.View style={refreshIconStyles}>
                    {CustomRefreshIcon ? (
                        <CustomRefreshIcon />
                    ) : (
                        <Text
                            style={{
                                fontFamily: fonts.family["Black-Italic"],
                                fontSize: fonts.size.body,
                                opacity: interpolate(pullDownPosition.value, [0, 75], [0.5, 1]),
                            }}
                        >
                            {config.APPLICATION_SHORT_NAME}
                        </Text>
                    )}
                </Animated.View>
            </Animated.View>

            <Animated.View
                style={[animatedFlatlistStyles, { flex: 1, overflow: "hidden" }]}
                {...panResponder.panHandlers}
            >
                {isLoading ? (
                    skeleton ? (
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: isDarkMode ? colors.gray.black : colors.gray.white,
                            }}
                        >
                            {skeleton}
                        </View>
                    ) : null
                ) : (
                    <Animated.FlatList
                        data={data}
                        style={{
                            backgroundColor: isDarkMode ? colors.gray.black : colors.gray.white,
                        }}
                        onScroll={scrollHandler}
                        scrollEventThrottle={8}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderItemWithElasticEffect}
                        ListHeaderComponent={ListHeaderComponent}
                        ListFooterComponent={ListFooterComponent}
                        ListEmptyComponent={ListEmptyComponent}
                        keyExtractor={(item, index) => index.toString()}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={onEndReachedThreshold}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={8}
                        windowSize={7}
                        initialNumToRender={10}
                        updateCellsBatchingPeriod={50}
                        maintainVisibleContentPosition={{
                            minIndexForVisible: 0,
                            autoscrollToTopThreshold: 10,
                        }}
                        getItemLayout={(data, index) => ({ length: 80, offset: 80 * index, index })}
                    />
                )}
            </Animated.View>

            {refreshing && showRefreshSpinner && (
                <Animated.View
                    style={[
                        {
                            backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
                            padding: sizes.paddings["1md"],
                            borderRadius: sizes.borderRadius["1xxl"],
                            borderWidth: 2,
                            borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
                            position: "absolute",
                            top: "40%",
                            left: sizes.screens.width / 2 - 38,
                            transform: [{ translateX: -50 }, { translateY: -50 }],
                            shadowColor: isDarkMode ? colors.gray.black : colors.gray.grey_02,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        },
                        loadingAnimationStyle,
                    ]}
                >
                    <Loading.ActivityIndicator size={40} />
                </Animated.View>
            )}
        </View>
    )
}
