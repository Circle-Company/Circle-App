import { PanResponder, TextStyle, View, ViewStyle, useColorScheme } from "react-native"
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import ColorTheme, { colors } from "../../layout/constants/colors"

import React from "react"
import { Loading } from "../../components/loading"
import { Text } from "../../components/Themed"
import config from "../../config"
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
    handleRefresh: () => Promise<void>
    CustomRefreshIcon?: React.ComponentType
}

const DefaultEmptyComponent = () => {
    const emptyContainerStyle: ViewStyle = {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: sizes.paddings["2md"],
        backgroundColor: "transparent",
        opacity: 0.8,
    }

    const emptyTextStyle: TextStyle = {
        fontSize: fonts.size.body,
        color: colors.gray.grey_04,
        textAlign: "center" as const,
        fontFamily: fonts.family.Medium,
    }

    return (
        <View style={emptyContainerStyle}>
            <Text style={emptyTextStyle}>
                Nenhum item encontrado
            </Text>
        </View>
    )
}

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

AnimatedListItem.displayName = "AnimatedListItem"

// Reduzir o threshold de ativação do refresh
const REFRESH_THRESHOLD = 50 // Era 75, agora mais fácil de ativar

export function AnimatedVerticalFlatlist<T>({
    data,
    renderItem,
    isLoading,
    ListFooterComponent,
    ListHeaderComponent,
    skeleton,
    onEndReached,
    handleRefresh = async () => {},
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

    // Ajustar a resistência do pull para ser mais suave
    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: (_, gestureState) =>
                    scrollPosition.value <= 0 && gestureState.dy > 0,
                onMoveShouldSetPanResponder: (_, gestureState) =>
                    scrollPosition.value <= 0 && gestureState.dy > 0,
                onPanResponderMove: (_, gestureState) => {
                    "worklet"
                    const maxDistance = 100 // Reduzido de 150 para 100
                    const resistance = 0.8 // Aumentado de 0.6 para 0.8 (mais suave)
                    const newPosition = Math.min(
                        maxDistance,
                        Math.max(0, gestureState.dy * resistance)
                    )

                    pullDownPosition.value = newPosition
                    isReadyToRefresh.value = newPosition > REFRESH_THRESHOLD
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

    // Otimizar a animação do ícone de refresh
    const refreshIconStyles = useAnimatedStyle(() => {
        "worklet"
        const pullRotation = interpolate(
            pullDownPosition.value,
            [0, REFRESH_THRESHOLD],
            [0, 360], // Reduzido de 720 para 360 (uma volta completa)
            { extrapolateRight: "clamp" }
        )

        return {
            opacity: refreshing
                ? 0.8
                : interpolate(pullDownPosition.value, [0, 25, REFRESH_THRESHOLD], [0.3, 0.6, 1], {
                    extrapolateRight: "clamp",
                }),
            transform: [
                {
                    scale: refreshing
                        ? 1
                        : interpolate(
                            pullDownPosition.value,
                            [0, REFRESH_THRESHOLD],
                            [0.7, 1], // Simplificado para ser mais direto
                            { extrapolateRight: "clamp" }
                        ),
                },
                {
                    rotate: refreshing ? `${rotation.value}deg` : `${pullRotation}deg`,
                },
            ],
        }
    })

    // Otimizar o tempo de animação do refresh
    React.useEffect(() => {
        if (refreshing) {
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 800, // Reduzido de 1000 para 800
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }),
                -1,
                false
            )
        } else {
            rotation.value = withTiming(0, {
                duration: 200, // Reduzido de 300 para 200
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            })
        }
    }, [refreshing])

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

    const styles = {
        container: {
            backgroundColor: ColorTheme().backgroundDisabled + "70",
            flex: 1,
        } as ViewStyle,

        refreshContainer: {
            position: "absolute",
            top: -50,
            width: "100%",
            alignItems: "center",
            zIndex: 1,
        } as ViewStyle,

        loadingSpinner: {
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
        } as ViewStyle,

        skeletonContainer: {
            flex: 1,
            backgroundColor: isDarkMode ? colors.gray.black : colors.gray.white,
        } as ViewStyle,

        flatlistContainer: {
            flex: 1,
            overflow: "hidden",
        } as ViewStyle,

        refreshText: {
            fontFamily: fonts.family["Black-Italic"],
            fontSize: fonts.size.body,
        } as ViewStyle,

        flatlist: {
            backgroundColor: isDarkMode ? colors.gray.black : colors.gray.white,
        } as ViewStyle,
    }

    return (
        <View
            pointerEvents={refreshing ? "none" : "auto"}
            style={styles.container}
        >
            <Animated.View
                style={[styles.refreshContainer, pullDownStyles]}
            >
                <Animated.View style={refreshIconStyles}>
                    {CustomRefreshIcon ? (
                        <CustomRefreshIcon />
                    ) : (
                        <Text
                            style={[
                                styles.refreshText,
                                { opacity: interpolate(pullDownPosition.value, [0, REFRESH_THRESHOLD], [0.5, 1]) }
                            ]}
                        >
                            {config.APPLICATION_SHORT_NAME}
                        </Text>
                    )}
                </Animated.View>
            </Animated.View>

            <Animated.View
                style={[animatedFlatlistStyles, styles.flatlistContainer]}
                {...panResponder.panHandlers}
            >
                {isLoading ? (
                    skeleton ? (
                        <View style={styles.skeletonContainer}>
                            {skeleton}
                        </View>
                    ) : null
                ) : (
                    <Animated.FlatList
                        data={data}
                        style={styles.flatlist}
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
                <Animated.View style={[styles.loadingSpinner, loadingAnimationStyle]}>
                    <Loading.ActivityIndicator size={40} />
                </Animated.View>
            )}
        </View>
    )
}
