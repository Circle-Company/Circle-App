import React from "react"
import { FlatList, RefreshControl, useColorScheme, View } from "react-native"
import OfflineCard from "../../../components/general/offline"
import { Loading } from "../../../components/loading"
import MemoryContext from "../../../contexts/memory"
import NetworkContext from "../../../contexts/network"
import LanguageContext from "../../../contexts/Preferences/language"
import { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import api from "../../../services/api"
import EndReached from "../list-memories-preview/components/end-reached"
import { RenderMemoryMoment } from "./components/render-memory_moment"

export default function ListMemoryMoments() {
    const margin = 20
    const { memory, memoryMoments, setMemoryMoments } = React.useContext(MemoryContext)
    const { t } = React.useContext(LanguageContext)
    const [centerIndex, setCenterIndex] = React.useState<number | null>(null)
    const flatListRef = React.useRef<FlatList | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [page, setPage] = React.useState<number>(1)
    const [pageSize] = React.useState<number>(100000)
    const [endReached, setEndReached] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const { networkStats } = React.useContext(NetworkContext)
    const isDarkMode = useColorScheme() === "dark"

    const handleScroll = React.useCallback(
        (event: any) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x + 60
            const screenWidth = sizes.screens.width
            const centerIndex = Math.floor(
                (contentOffsetX + screenWidth / 2) / (sizes.moment.small.width + margin)
            )
            setCenterIndex(centerIndex >= 0 ? centerIndex : 0)
        },
        [setCenterIndex]
    )

    React.useEffect(() => {
        setCenterIndex(0)
    }, [])

    async function fetchData() {
        await api
            .post(`/memory/get-moments?page=${page}&pageSize=${pageSize}`, {
                memory_id: memory?.id,
            })
            .then(function (response) {
                if (page == 1) setMemoryMoments(response.data.data)
                else {
                    setMemoryMoments([...memoryMoments, ...response.data.data])
                    if (pageSize > response.data.data.length) setEndReached(true)
                    else setEndReached(false)
                }
                setPage(page + 1)
            })
            .catch(function (error) {
                setLoading(false)
                console.log(error)
            })
    }

    React.useEffect(() => {
        setLoading(true)
        fetchData().finally(() => {
            setLoading(false)
            setRefreshing(false)
        })
    }, [])

    React.useEffect(() => {
        if (networkStats !== "OFFLINE") {
            setLoading(true)
            fetchData().finally(() => {
                setLoading(false)
                setRefreshing(false)
            })
        }
    }, [networkStats])

    const handleRefresh = async () => {
        setPage(1)
        setLoading(true)
        await fetchData().finally(() => {
            setTimeout(() => {
                setLoading(false)
                setRefreshing(false)
            }, 200)
        })
    }

    const container_0 = {
        marginLeft: (sizes.screens.width - sizes.moment.small.width + margin * 2) / 2 - margin,
        marginRight: margin,
    }
    const container = {
        marginRight: margin,
    }
    const container_1 = {}

    const viewabilityConfig = {
        minimumViewTime: 3000,
        viewAreaCoveragePercentThreshold: 100,
        waitForInteraction: true,
    }

    if (networkStats == "OFFLINE" && memoryMoments.length == 0)
        return <OfflineCard height={(sizes.screens.height - sizes.headers.height) / 2} />

    if (loading)
        return (
            <Loading.Container
                width={sizes.screens.width}
                height={(sizes.screens.height - sizes.headers.height) * 0.8}
            >
                <Loading.ActivityIndicator />
            </Loading.Container>
        )
    return (
        <FlatList
            data={memoryMoments}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            viewabilityConfig={viewabilityConfig}
            scrollEventThrottle={16}
            snapToInterval={sizes.moment.small.width + margin}
            decelerationRate="fast"
            maxToRenderPerBatch={3}
            keyExtractor={(moment: any) => moment.id.toString()}
            disableIntervalMomentum={true}
            onScroll={handleScroll}
            directionalLockEnabled={true}
            ref={(ref) => {
                flatListRef.current = ref
            }}
            onEndReachedThreshold={0.3}
            onEndReached={async () => {
                fetchData()
            }}
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
            renderItem={({ item, index }) => {
                const focused = index === centerIndex
                return (
                    <View
                        style={
                            index == 0
                                ? container_0
                                : container && index + 1 == memoryMoments.length
                                  ? container_1
                                  : container
                        }
                    >
                        <RenderMemoryMoment focused={focused} moment={item} />
                    </View>
                )
            }}
            ListFooterComponent={() => {
                if (endReached)
                    return (
                        <EndReached
                            width={sizes.moment.small.width * 0.6}
                            height={(sizes.screens.height - sizes.headers.height) * 0.78}
                            style={{
                                marginLeft: sizes.margins["1lg"],
                                marginRight: sizes.margins["1md"],
                            }}
                            text={t("No more Moments")}
                        />
                    )
                else
                    return (
                        <Loading.Container
                            width={sizes.moment.small.width / 1.8}
                            height={(sizes.screens.height - sizes.headers.height) * 0.8}
                        >
                            <Loading.ActivityIndicator />
                        </Loading.Container>
                    )
            }}
        />
    )
}
