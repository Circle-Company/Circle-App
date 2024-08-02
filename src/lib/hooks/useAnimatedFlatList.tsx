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

type AnimatedFlatlistProps<T> = {
    data: Array<T>
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement
    ListFooterComponent: () => React.ReactElement
    onEndReachedThreshold: number
    onEndReached: () => Promise<void>
    handleRefresh: () => void
    CustomRefreshIcon?: React.ComponentType // Adiciona a propriedade para customização do ícone de refresh
}

export function AnimatedVerticalFlatlist<T>({
    data,
    renderItem,
    ListFooterComponent,
    onEndReached,
    handleRefresh,
    onEndReachedThreshold,
    CustomRefreshIcon,
}: AnimatedFlatlistProps<T>) {
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
        setTimeout(() => {
            setRefreshing(false)
            pullDownPosition.value = withTiming(0, { duration: 300 })
        }, 2000)
    }

    const pullDownStyles = useAnimatedStyle(() => ({
        transform: [{ translateY: pullDownPosition.value }],
    }))

    const onPanRelease = () => {
        if (isReadyToRefresh.value) {
            pullDownPosition.value = withTiming(75, { duration: 300 })
            isReadyToRefresh.value = false
            runOnJS(onRefresh)()
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
                    isReadyToRefresh.value = pullDownPosition.value > 75
                },
                onPanResponderRelease: () => onPanRelease(),
                onPanResponderTerminate: () => {
                    pullDownPosition.value = withTiming(0, { duration: 300 })
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

    const animatedFlatlistStyles = useAnimatedStyle(() => {
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

            <Animated.View
                style={[animatedFlatlistStyles, { flex: 1 }]}
                {...panResponder.panHandlers}
            >
                <Animated.FlatList
                    data={data}
                    style={{ backgroundColor: ColorTheme().background }}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => renderItem({ item, index })}
                    ListFooterComponent={ListFooterComponent}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={onEndReachedThreshold}
                />
            </Animated.View>

            {refreshing && (
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
