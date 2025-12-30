import { FlatList, TextStyle, ViewStyle } from "react-native"
import Reanimated, { FadeInUp } from "react-native-reanimated"
import { Text, View } from "../../Themed"

import BottomSheetContext from "../../../contexts/bottomSheet"
import ButtonClose from "../../buttons/close"
import { CommentObject } from "../comments-types"
import LanguageContext from "../../../contexts/Preferences/language"
import { Loading } from "../../loading"
import NetworkContext from "../../../contexts/network"
import OfflineCard from "../../general/offline"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import RenderComment from "./comments-render_comment"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import MomentContext from "@/components/moment/context"
import api from "@/services/Api"

function FetchedCommentsList({
    totalComments,
    momentId,
}: {
    totalComments: number
    momentId: string | number
}) {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { networkStats } = React.useContext(NetworkContext)
    const { data } = React.useContext(MomentContext)
    const { collapse } = React.useContext(BottomSheetContext)
    const [page, setPage] = React.useState<number>(1)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [endReached, setEndReached] = React.useState<boolean>(false)
    const [allComments, setAllComments] = React.useState<CommentObject[]>([] as CommentObject[])
    const pageSize = 4

    const titleContainer: ViewStyle = {
        flex: 1,
        flexDirection: "row",
        alignSelf: "center",
        paddingHorizontal: sizes.paddings["1sm"],
        marginBottom: sizes.margins["2sm"],
        height: sizes.headers.height * 0.7,
        alignItems: "center",
        justifyContent: "flex-start",
    }

    const title: TextStyle = {
        marginLeft: sizes.margins["2sm"] * 0.7,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
    }

    const inputOverflow: ViewStyle = {
        zIndex: 100,
        position: "absolute",
        bottom: 0,
        width: sizes.screens.width,
    }

    async function fetchData() {
        if (!momentId) {
            return
        }
        await api
            .get(`/moments/${momentId}/comments?page=${page}&pageSize=${pageSize}`, {
                headers: { Authorization: session.account.jwtToken },
            })
            .then(function (response: any) {
                if (page === 1) setAllComments(response.data.comments)
                else {
                    setAllComments([...allComments, ...response.data.comments])
                    if (page > response.data.totalPages) setEndReached(true)
                    else setEndReached(false)
                }
                setPage(page + 1)
            })
    }

    React.useEffect(() => {
        if (momentId) {
            setLoading(true)
            if (momentId && momentId !== "0")
                fetchData().finally(() => {
                    setLoading(false)
                })
        }
    }, [momentId])

    React.useEffect(() => {
        // Temporariamente desabilitado para usar dados mock
        /*if (momentId) fetchData()*/
    }, [networkStats])

    if (networkStats == "OFFLINE" && allComments?.length == 0)
        return <OfflineCard height={sizes.screens.height - sizes.headers.height} />
    if (loading)
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
            showsVerticalScrollIndicator={false}
            onEndReached={async () => {
                // Temporariamente desabilitado para usar dados mock
                /*if (momentId) {
                    await fetchData()
                }*/
            }}
            scrollEventThrottle={16}
            onEndReachedThreshold={0.1}
            scrollEnabled={true}
            data={allComments}
            keyExtractor={(item: CommentObject, index: number) => String(item.id || index)}
            ListHeaderComponent={() => (
                <View style={titleContainer}>
                    <View style={{ flex: 1 }}>
                        <Text style={title}>
                            {data.metrics.totalComments} {t("Comments")}
                        </Text>
                    </View>
                    <ButtonClose onPress={collapse} />
                </View>
            )}
            renderItem={({ item, index }) => (
                <Reanimated.View
                    style={{ width: "100%", alignSelf: "center" }}
                    entering={FadeInUp.duration(250)}
                >
                    <RenderComment preview={false} comment={item} index={index} />
                </Reanimated.View>
            )}
            ListFooterComponent={() => {
                if (endReached) {
                    if (allComments.length == 0)
                        return <Text>{t("No one has commented yet.")}</Text>
                    else return <Text>{t("No more comments.")}</Text>
                } else
                    return (
                        <Loading.Container
                            width={sizes.moment.standart.width}
                            height={sizes.headers.height * 2}
                        >
                            <Loading.ActivityIndicator size={25} />
                        </Loading.Container>
                    )
            }}
            style={{ width: sizes.moment.standart.width, alignSelf: "center" }}
        />
    )
}

export default FetchedCommentsList
