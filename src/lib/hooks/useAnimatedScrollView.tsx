import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated"
import ColorTheme, { colors } from "../../constants/colors"
import { PanResponder, View, useColorScheme, ActivityIndicator } from "react-native"

import { Loading } from "../../components/loading"
import React from "react"
import { Text } from "../../components/Themed"
import { Vibrate } from "./useHapticFeedback"
import config from "../../config"
import fonts from "../../constants/fonts"
import sizes from "../../constants/sizes"
import { isIOS } from "../platform/detection"

type AnimatedScrollViewProps = {
    children: React.ReactNode
    disableVibrate?: boolean
    ListFooterComponent?: () => React.ReactElement
    onEndReachedThreshold: number
    onEndReached: () => Promise<void>
    handleRefresh: () => void
    endRefreshAnimationDelay?: number
    showRefreshSpinner?: boolean
    CustomRefreshIcon?: React.ComponentType // Propriedade para customização do ícone de refresh
    elasticEffect?: boolean // NOVO: controla o efeito elástico/bounce
    onScrollChange?: (hasScrolled: boolean) => void // Callback quando scroll muda
    scrollThreshold?: number // Threshold para considerar que houve scroll
    scrollY?: Animated.SharedValue<number> // NOVO: permite passar o shared value do scroll
}

export function AnimatedVerticalScrollView({
    children,
    disableVibrate = false,
    ListFooterComponent,
    onEndReached,
    handleRefresh,
    endRefreshAnimationDelay = 200,
    onEndReachedThreshold,
    showRefreshSpinner = false,
    CustomRefreshIcon,
    elasticEffect = true, // padrão: ativado
    onScrollChange,
    scrollThreshold = 10,
    scrollY,
}: AnimatedScrollViewProps) {
    const isDarkMode = useColorScheme() === "dark"
    const scrollPosition = scrollY ?? useSharedValue(0)
    const pullDownPosition = useSharedValue(0)
    const isReadyToRefresh = useSharedValue(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const rotation = useSharedValue(0)

    const gradientColors = useSharedValue({
        startColor: "rgba(50, 0, 255, 0)",
        endColor: "rgba(50, 0, 0, 0)",
    })

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollPosition.value = event.contentOffset.y
            gradientColors.value = {
                startColor: `rgba(0, 0, 255, ${Math.min(1, event.contentOffset.y / 150)})`,
                endColor: `rgba(0, 0, 0, ${Math.min(1, event.contentOffset.y / 150)})`,
            }

            // Notificar mudança de scroll se callback fornecido
            if (onScrollChange) {
                const hasScrolled = event.contentOffset.y > scrollThreshold
                runOnJS(onScrollChange)(hasScrolled)
            }
        },
    })

    const onRefresh = () => {
        setRefreshing(true)
        handleRefresh()
        if (!disableVibrate) Vibrate("effectTick")
        setTimeout(() => {
            setRefreshing(false)
            pullDownPosition.value = withTiming(0, { duration: 300 })
        }, endRefreshAnimationDelay)
    }

    const pullDownStyles = useAnimatedStyle(() => ({
        transform: [{ translateY: pullDownPosition.value }],
    }))

    const onPanRelease = () => {
        if (isReadyToRefresh.value) {
            pullDownPosition.value = withTiming(75, { duration: 300 })
            isReadyToRefresh.value = false
            runOnJS(onRefresh)()
            if (!disableVibrate) Vibrate("effectTick")
        } else {
            pullDownPosition.value = withTiming(0, { duration: 300 })
        }
    }

    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: (_, gestureState) =>
                    scrollPosition.value <= 0 && gestureState.dy > 0,
                onMoveShouldSetPanResponder: (_, gestureState) =>
                    scrollPosition.value <= 0 && gestureState.dy > 0,
                onPanResponderMove: (_, gestureState) => {
                    const maxDistance = 150
                    pullDownPosition.value = Math.min(maxDistance, Math.max(0, gestureState.dy))
                    isReadyToRefresh.value = pullDownPosition.value > 120
                },
                onPanResponderRelease: () => onPanRelease(),
                onPanResponderTerminate: () => {
                    pullDownPosition.value = withTiming(0, { duration: 300 })
                    if (!disableVibrate) Vibrate("clockTick")
                },
            }),
        // Dependemos apenas das referências dos shared values e flags estáticas,
        // nunca de `.value` diretamente para evitar erro do Reanimated.
        [scrollPosition, pullDownPosition, isReadyToRefresh, disableVibrate, onRefresh],
    )

    const refreshIconStyles = useAnimatedStyle(() => {
        "worklet"
        const pullRotation = interpolate(pullDownPosition.value, [0, 120], [0, 360], {
            extrapolateRight: "clamp",
        })

        // Para iOS com ActivityIndicator nativo, não aplicar rotação manual
        const shouldApplyRotation = !isIOS || CustomRefreshIcon

        return {
            opacity: refreshing
                ? 0.8
                : interpolate(pullDownPosition.value, [0, 25, 120], [0.3, 0.6, 1], {
                      extrapolateRight: "clamp",
                  }),
            transform: [
                {
                    scale: refreshing
                        ? 1
                        : interpolate(pullDownPosition.value, [0, 120], [0.7, 1], {
                              extrapolateRight: "clamp",
                          }),
                },
                ...(shouldApplyRotation
                    ? [
                          {
                              rotate: refreshing ? `${rotation.value}deg` : `${pullRotation}deg`,
                          },
                      ]
                    : []),
            ],
        }
    })

    const loadingAnimationStyle = useAnimatedStyle(() => ({
        opacity: withTiming(refreshing ? 1 : 0, { duration: 300 }),
        transform: [{ scale: withTiming(refreshing ? 1 : 0.5, { duration: 300 }) }],
    }))

    const animatedScrollViewStyles = useAnimatedStyle(() => {
        const borderRadius = interpolate(pullDownPosition.value, [0, 150], [0, 20])
        return {
            transform: [{ translateY: pullDownPosition.value }],
            borderRadius,
            overflow: "hidden",
        }
    })

    React.useEffect(() => {
        if (refreshing) {
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 800,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }),
                -1,
                false,
            )
        } else {
            rotation.value = withTiming(0, {
                duration: 200,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            })
        }
    }, [refreshing])

    return (
        <View
            pointerEvents={refreshing ? "none" : "auto"}
            style={{
                backgroundColor: isIOS ? colors.gray.black : colors.gray.grey_08,
            }}
        >
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        top: -50,
                        width: "100%",
                        alignItems: "center",
                    },
                    pullDownStyles,
                ]}
            >
                <Animated.View style={refreshIconStyles}>
                    {CustomRefreshIcon ? (
                        <CustomRefreshIcon />
                    ) : isIOS ? (
                        <View style={{ transform: [{ scale: 1.4 }] }}>
                            <ActivityIndicator
                                size="large"
                                color={colors.gray.grey_03}
                                animating={true}
                            />
                        </View>
                    ) : (
                        <Text
                            style={{
                                fontFamily: fonts.family["Black-Italic"],
                                fontSize: fonts.size.body,
                            }}
                        >
                            {config.APPLICATION_SHORT_NAME}
                        </Text>
                    )}
                </Animated.View>
            </Animated.View>

            <Animated.View style={animatedScrollViewStyles} {...panResponder.panHandlers}>
                <Animated.ScrollView
                    style={{ backgroundColor: ColorTheme().background }}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    bounces={elasticEffect} // iOS
                    overScrollMode={elasticEffect ? "always" : "never"} // Android
                    onScrollEndDrag={({ nativeEvent }) => {
                        if (
                            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
                            nativeEvent.contentSize.height -
                                onEndReachedThreshold * nativeEvent.layoutMeasurement.height
                        ) {
                            onEndReached()
                        }
                    }}
                >
                    {children}
                    {ListFooterComponent && <ListFooterComponent />}
                </Animated.ScrollView>
            </Animated.View>

            {refreshing && showRefreshSpinner && !isIOS && (
                <Animated.View
                    style={[
                        {
                            backgroundColor: colors.gray.grey_09,
                            padding: sizes.paddings["1md"],
                            borderRadius: sizes.borderRadius["1xxl"],
                            borderWidth: 2,
                            borderColor: colors.gray.grey_08,
                            position: "absolute",
                            top: "40%",
                            left: sizes.screens.width / 2 - 38,
                            transform: [{ translateX: -50 }, { translateY: -50 }],
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
