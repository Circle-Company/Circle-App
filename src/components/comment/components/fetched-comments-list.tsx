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

const MOCK_COMMENTS: CommentObject[] = [
    {
        id: "1",
        user: {
            id: "1",
            username: "johndoe",
            verified: true,
            profile_picture: {
                small_resolution: "https://picsum.photos/50/50",
                tiny_resolution: "https://picsum.photos/30/30",
            },
            youFollow: true,
        },
        content: "Que foto incrível! Adorei as cores e a composição. 📸✨",
        created_at: "2024-03-20T10:30:00Z",
        statistics: {
            total_likes_num: 15,
        },
        is_liked: true,
    },
    {
        id: "2",
        user: {
            id: "2",
            username: "mariasilva",
            verified: false,
            profile_picture: {
                small_resolution: "https://picsum.photos/51/51",
                tiny_resolution: "https://picsum.photos/31/31",
            },
            youFollow: false,
        },
        content: "Esse lugar é maravilhoso! Onde fica? Quero muito conhecer! 🌎",
        created_at: "2024-03-20T11:15:00Z",
        statistics: {
            total_likes_num: 8,
        },
        is_liked: false,
    },
    {
        id: "3",
        user: {
            id: "3",
            username: "photoexpert",
            verified: true,
            profile_picture: {
                small_resolution: "https://picsum.photos/52/52",
                tiny_resolution: "https://picsum.photos/32/32",
            },
            youFollow: true,
        },
        content: "A luz natural nessa foto está perfeita! Qual câmera você usou? 📷",
        created_at: "2024-03-20T12:00:00Z",
        statistics: {
            total_likes_num: 25,
        },
        is_liked: true,
    },
    {
        id: "4",
        user: {
            id: "4",
            username: "travelgram",
            verified: false,
            profile_picture: {
                small_resolution: "https://picsum.photos/53/53",
                tiny_resolution: "https://picsum.photos/33/33",
            },
            youFollow: false,
        },
        content: "Mais um lugar para adicionar na minha lista de destinos! 🗺️✈️",
        created_at: "2024-03-20T13:45:00Z",
        statistics: {
            total_likes_num: 12,
        },
        is_liked: false,
    },
]

function FetchedCommentsList({
    totalCommentsNum,
    momentId,
}: {
    totalCommentsNum: number
    momentId: string | number
}) {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { networkStats } = React.useContext(NetworkContext)
    const { collapse } = React.useContext(BottomSheetContext)
    const [page, setPage] = React.useState<number>(1)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [endReached, setEndReached] = React.useState<boolean>(false)
    const [allComments, setAllComments] = React.useState<CommentObject[]>(MOCK_COMMENTS)
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
        // Temporariamente comentado para usar dados mock
        /*if (!momentId) {
            return
        }
        await api
            .get(`/moments/${momentId}/comments?page=${page}&pageSize=${pageSize}`, {
                headers: { Authorization: session.account.jwtToken },
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
            })*/
    }

    React.useEffect(() => {
        // Temporariamente desabilitado para usar dados mock
        /*if (momentId) {
            setLoading(true)
            if (momentId && momentId !== "0")
                fetchData().finally(() => {
                    setLoading(false)
                })
        }*/
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
                            {totalCommentsNum} {t("Comments")}
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
