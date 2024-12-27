import PersistedContext from "@/contexts/Persisted"
import LanguageContext from "@/contexts/Preferences/language"
import React from "react"
import { FlatList, RefreshControl, useColorScheme } from "react-native"
import Reanimated, { FadeInUp } from "react-native-reanimated"
import NetworkContext from "../../../contexts/network"
import EndReached from "../../../features/list-memories/list-memories-preview/components/end-reached"
import { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import api from "../../../services/Api"
import OfflineCard from "../../general/offline"
import { Loading } from "../../loading"
import MomentContext from "../../moment/context"
import { useCommentsContext } from "../comments-context"
import RenderComment from "./comments-render_comment"
import ZeroComments from "./comments-zero_comments"

export default function list_comments() {
    const { comment, preview } = useCommentsContext()
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { networkStats } = React.useContext(NetworkContext)
    const isDarkMode = useColorScheme() === "dark"
    const [page, setPage] = React.useState<number>(1)
    const [pageSize, setPageSize] = React.useState<number>(4)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [refreshing, setRefreshing] = React.useState<boolean>(false)
    const [endReached, setEndReached] = React.useState<boolean>(false)
    const [allComments, setAllComments] = React.useState<Object[]>()
    const { momentData } = React.useContext(MomentContext)

    async function fetchData() {
        await api
            .get(`/moments/${momentData.id}/comments?page=${page}&pageSize=${pageSize}`, {
                headers: { authorization_token: session.account.jwtToken },
            })
            .then(function (response) {
                if (page === 1) setAllComments(response.data.comments)
                else {
                    setAllComments([...allComments, ...response.data.comments])
                    if (page > response.data.totalPages) setEndReached(true)
                    else setEndReached(false)
                }
                setPage(page + 1)
            })
            .catch(function (error) {
                console.log(error)
            })
    }

    React.useEffect(() => {
        if (preview == false) {
            setLoading(true)
            if (momentData.id !== 0)
                fetchData().finally(() => {
                    setLoading(false)
                    setRefreshing(false)
                })
        }
    }, [momentData.id])

    React.useEffect(() => {
        if (preview == false) fetchData()
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

    if (networkStats == "OFFLINE" && allComments?.length == 0 && preview == false)
        return <OfflineCard height={sizes.screens.height - sizes.headers.height} />
    if (loading && preview == false)
        return (
            <Loading.Container
                width={sizes.moment.standart.width}
                height={sizes.screens.height - sizes.headers.height}
            >
                <Loading.ActivityIndicator />
            </Loading.Container>
        )

    return (
        <FlatList
            showsVerticalScrollIndicator={true}
            onEndReached={async () => {
                await fetchData()
            }}
            onEndReachedThreshold={0.1}
            scrollEnabled={false}
            data={preview ? comment?.comments : allComments}
            keyExtractor={(item: any, index: any) => index}
            refreshControl={
                <>
                    {!preview && (
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
                    )}
                </>
            }
            renderItem={({ item, index }) => {
                return (
                    <Reanimated.View
                        entering={
                            preview ? FadeInUp.duration(100 * (index + 1)) : FadeInUp.duration(250)
                        }
                    >
                        <RenderComment preview={preview} comment={item} index={index} />
                    </Reanimated.View>
                )
            }}
            ListFooterComponent={() => {
                if (preview == false) {
                    if (endReached)
                        return (
                            <EndReached
                                width={sizes.moment.standart.width}
                                text={
                                    allComments?.length == 0
                                        ? t("No one has commented yet.")
                                        : t("No more comments.")
                                }
                            />
                        )
                    else
                        return (
                            <Loading.Container
                                width={sizes.moment.standart.width}
                                height={sizes.headers.height * 2}
                            >
                                <Loading.ActivityIndicator />
                            </Loading.Container>
                        )
                }
                if (preview && comment?.comments?.length == 0) {
                    return <ZeroComments />
                }
            }}
        />
    )
}
