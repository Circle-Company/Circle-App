import React from "react"
import { PanResponder, View, useColorScheme } from "react-native"
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { Text } from "../../components/Themed"
import { Loading } from "../../components/loading"
import config from "../../config"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"
import { Vibrate } from "./useHapticFeedback"

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
}

export function AnimatedVerticalScrollView({
    children,
    disableVibrate = false,
    ListFooterComponent,
    onEndReached,
    handleRefresh,
    endRefreshAnimationDelay = 200,
    onEndReachedThreshold,
    showRefreshSpinner = true,
    CustomRefreshIcon,
}: AnimatedScrollViewProps) {
    const isDarkMode = useColorScheme() === "dark"
    const scrollPosition = useSharedValue(0)
    const pullDownPosition = useSharedValue(0)
    const isReadyToRefresh = useSharedValue(false)
    const [refreshing, setRefreshing] = React.useState(false)

    const gradientColors = useSharedValue({
        startColor: `rgba(50, 0, 255, 0)`,
        endColor: `rgba(50, 0, 0, 0)`,
    })

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollPosition.value = event.contentOffset.y
            gradientColors.value = {
                startColor: `rgba(0, 0, 255, ${Math.min(1, event.contentOffset.y / 150)})`,
                endColor: `rgba(0, 0, 0, ${Math.min(1, event.contentOffset.y / 150)})`,
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
        [scrollPosition.value, pullDownPosition.value, isReadyToRefresh.value]
    )

    const refreshIconStyles = useAnimatedStyle(() => ({
        opacity: refreshing ? 0.8 : pullDownPosition.value / 75 - 0.2,
        transform: [{ scale: pullDownPosition.value / 75 }],
    }))

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

    return (
        <View
            pointerEvents={refreshing ? "none" : "auto"}
            style={{
                backgroundColor: ColorTheme().backgroundDisabled + "70",
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

            <Animated.View style={[animatedScrollViewStyles]} {...panResponder.panHandlers}>
                <Animated.ScrollView
                    style={{ backgroundColor: ColorTheme().background }}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
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
