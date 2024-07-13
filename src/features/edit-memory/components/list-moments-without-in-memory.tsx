import {
    FlatList,
    RefreshControl,
    ScrollView,
    useColorScheme,
    View,
    Keyboard,
    Animated,
    Easing,
} from "react-native"
import { Text } from "../../../components/Themed"
import RenderMoment from "./render-moments"
import EndReached from "../../list-memories/list-memories-all/components/end-reached"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import NetworkContext from "../../../contexts/network"
import React from "react"
import api from "../../../services/Api"
import { Loading } from "../../../components/loading"
import OfflineCard from "../../../components/general/offline"
import AuthContext from "../../../contexts/auth"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"
import MemoryContext from "../../../contexts/memory"
import ViewMorebutton from "../../../components/buttons/view_more"
import AddIcon from "../../../assets/icons/svgs/plus_circle-outline.svg"
import { opacity } from "react-native-reanimated/lib/typescript/reanimated2/Colors"
import EditMemoryContext from "../edit_memory_context"
export default function ListMomentsWithoutInMemory() {
    const isDarkMode = useColorScheme() === "dark"
    const { memory } = React.useContext(MemoryContext)
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const [allMoments, setAllMoments] = React.useState<Array<any>>([])
    const [loading, setLoading] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(15)
    const [totalPages, setTotalPages] = React.useState(1)
    const [refreshing, setRefreshing] = React.useState(false)
    const [endReached, setEndReached] = React.useState(false)
    const { networkStats } = React.useContext(NetworkContext)
    const { selectedMoments, addMoments } = React.useContext(EditMemoryContext)
    const animation = React.useRef(new Animated.Value(-sizes.headers.height * 0.8)).current

    const addMomentsFunc = async () => {
        if (selectedMoments.length > 0) {
            await addMoments()
        }
    }
    const fetchData = async () => {
        async function getMoments() {
            try {
                await api
                    .post(`/moment/get-user-moments/tiny/exclude-memory`, {
                        user_id: session.user.id,
                        memory_id: memory.id,
                    })
                    .then(function (response) {
                        if (page === 1) setAllMoments(response.data)
                        else setAllMoments([...allMoments, ...response.data])
                        setEndReached(response.data.length < pageSize)
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            } catch (err) {
                console.error(err)
            }
        }
        getMoments()
    }

    React.useEffect(() => {
        setPage(1)
        setLoading(true)
        fetchData().finally(() => {
            setLoading(false)
            setRefreshing(false)
        })
    }, [])

    const handleLoadMore = () => {
        //setPage(page + 1);
        fetchData()
    }

    const handleRefresh = () => {
        setPage(1)
        setLoading(true)
        fetchData().finally(() => {
            setTimeout(() => {
                setLoading(false)
                setRefreshing(false)
            }, 200)
        })
    }
    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
        const paddingToBottom = 20
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    }

    const container: any = {
        transform: [{ translateY: animation }],
    }
    const item_container = {
        width: sizes.screens.width,
        paddingHorizontal: 8,
    }

    const title_style: any = {
        alignSelf: "center",
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
        flex: 1,
    }

    const header: any = {
        width: sizes.screens.width,
        height: sizes.headers.height,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1md"] * 0.7,
    }

    if (networkStats == "OFFLINE" && allMoments.length == 0)
        return <OfflineCard height={(sizes.screens.height - sizes.headers.height) / 2} />

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            Animated.timing(animation, {
                toValue: 0, // Move it above the input
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start()
        })
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            Animated.timing(animation, {
                toValue: -sizes.headers.height * 0.8, // Move it back to the bottom
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start()
        })
        return () => {
            keyboardDidShowListener.remove()
            keyboardDidHideListener.remove()
        }
    }, [])

    return (
        <Animated.View style={container}>
            <View style={header}>
                <Text style={title_style}>{t("Add Moments")}</Text>
                <View style={{ opacity: selectedMoments.length > 0 ? 1 : 0.3 }}>
                    <ViewMorebutton
                        text={t("Add")}
                        icon={
                            <AddIcon
                                style={{ top: 0.5 }}
                                width={12}
                                height={12}
                                fill={colors.blue.blue_05.toString()}
                            />
                        }
                        action={addMomentsFunc}
                    />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <FlatList
                    scrollEnabled={false}
                    data={allMoments}
                    style={{ flex: 1 }}
                    keyExtractor={(item: any) => item.id}
                    contentContainerStyle={item_container}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    numColumns={3}
                    renderItem={({ item }) => {
                        return <RenderMoment moment={item} />
                    }}
                    ListFooterComponent={() => {
                        if (!loading || page >= totalPages) return null
                        else if (endReached) return <EndReached text="No more Memories" />
                    }}
                    onEndReachedThreshold={0.1}
                    onEndReached={handleLoadMore}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setPage(1)
                        setRefreshing(true)
                    }}
                    onScroll={({ nativeEvent }) => {
                        if (!endReached && isCloseToBottom(nativeEvent)) handleLoadMore()
                    }}
                    scrollEventThrottle={400}
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
                            onRefresh={handleRefresh}
                        />
                    }
                />
            </ScrollView>
        </Animated.View>
    )
}
