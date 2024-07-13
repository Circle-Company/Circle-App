import React from "react"
import { FlatList, RefreshControl, ScrollView, useColorScheme } from "react-native"
import OfflineCard from "../../components/general/offline"
import { Loading } from "../../components/loading"
import { Text, View } from "../../components/Themed"
import NetworkContext from "../../contexts/network"
import PersistedContext from "../../contexts/Persisted"
import LanguageContext from "../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"
import api from "../../services/Api"
import EndReached from "../list-memories/list-memories-all/components/end-reached"
import RenderMoment from "./components/render-moments"

export default function ListAllMoments() {
    const isDarkMode = useColorScheme() === "dark"
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const [allMoments, setAllMoments] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [pageSize] = React.useState(15)
    const [totalPages] = React.useState(1)
    const [refreshing, setRefreshing] = React.useState(false)
    const [endReached, setEndReached] = React.useState(false)
    const { networkStats } = React.useContext(NetworkContext)

    const fetchData = async () => {
        async function getMoments() {
            try {
                await api
                    .post(`/moment/get-user-moments/tiny?page=${page}&pageSize=${pageSize}`, {
                        user_id: session.user.id,
                    })
                    .then(function (response) {
                        if (page === 1) {
                            setAllMoments(response.data.moments)
                        } else {
                            setAllMoments([...allMoments, ...response.data.moments])
                        }
                        setEndReached(response.data.memories.length < pageSize)
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
        setLoading(true)
        fetchData().finally(() => {
            setLoading(false)
            setRefreshing(false)
        })
    }, [])

    const handleLoadMore = () => {
        setPage(page + 1)
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
    const item_container = {
        width: sizes.screens.width,
        paddingHorizontal: 8,
    }

    const header_container = {
        paddingHorizontal: sizes.paddings["1md"],
        alignItems: "center",
        justifyContent: "center",
    }

    const header_text = {
        marginTop: sizes.margins["2sm"],
        marginBottom: sizes.margins["1sm"],
        fontSize: fonts.size.body * 0.8,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        textAlign: "justify",
    }

    if (networkStats == "OFFLINE" && allMoments.length == 0)
        return <OfflineCard height={(sizes.screens.height - sizes.headers.height) / 2} />

    if (loading)
        return (
            <Loading.Container
                width={sizes.screens.width}
                height={sizes.screens.height - sizes.headers.height * 1.5}
            >
                <Loading.ActivityIndicator />
            </Loading.Container>
        )

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={header_container}>
                <Text style={header_text}>
                    {t(
                        "You can view all the moments created and you can delete them if you want. They will be removed from the memories automatically."
                    )}
                </Text>
            </View>
            <FlatList
                scrollEnabled={false}
                data={allMoments}
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
    )
}
