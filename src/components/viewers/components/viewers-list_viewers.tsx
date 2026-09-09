import React from "react"
import { ActivityIndicator, RefreshControl, View } from "react-native"
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated"
import sizes from "@/constants/sizes"
import { useViewersContext } from "../viewers-context"
import { ViewersListViewersProps } from "../viewers-types"
import RenderViewer from "./viewers-render_viewer"
import Stats from "./viewers-stats"
import ZeroViewers from "./viewers-zero_viewers"

const AnimatedFlatList = Animated.FlatList

export default function ListViewers({
    height,
    scrollY,
    refreshing = false,
    onRefresh,
    loadingMore = false,
    onEndReached,
}: ViewersListViewersProps) {
    const { viewers, errorCode, loading } = useViewersContext()

    // O offset desta lista é o que continua encolhendo o moment enquanto o
    // painel está aberto — por isso ele sai daqui para um SharedValue.
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            "worklet"
            if (scrollY) scrollY.value = event.contentOffset.y
        },
    })

    if (loading) {
        return (
            <View
                style={{
                    height: height ?? 80,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator color="#888" />
            </View>
        )
    }

    return (
        <AnimatedFlatList
            style={height ? { height } : undefined}
            data={viewers}
            keyExtractor={(item: any) => String(item.userId)}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            scrollEnabled={!!height}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: sizes.paddings["1md"] }}
            renderItem={({ item, index }: any) => <RenderViewer viewer={item} index={index} />}
            ListHeaderComponent={<Stats />}
            ListEmptyComponent={<ZeroViewers code={errorCode} />}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#888"
                        colors={["#888"]}
                    />
                ) : undefined
            }
            onEndReachedThreshold={0.5}
            onEndReached={onEndReached}
            ListFooterComponent={
                loadingMore ? (
                    <View style={{ paddingVertical: sizes.paddings["1sm"] }}>
                        <ActivityIndicator color="#888" />
                    </View>
                ) : null
            }
        />
    )
}
