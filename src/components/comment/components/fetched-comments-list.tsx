import {
    View,
    Text,
    FlatList,
    TextStyle,
    ViewStyle,
    Platform,
    Keyboard,
    Animated,
} from "react-native"
import Reanimated, { FadeInUp } from "react-native-reanimated"

import BottomSheetContext from "../../../contexts/bottomSheet"
import ButtonClose from "../../buttons/close"
import { CommentObject } from "../comments-types"
import LanguageContext from "../../../contexts/language"
import { Loading } from "../../loading"
import NetworkContext from "../../../contexts/network"
import OfflineCard from "../../general/offline"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import RenderComment from "./comments-render_comment"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import MomentContext from "@/components/moment/context"
import api from "@/api"
import { colors } from "@/constants/colors"
import Input from "./comments-input"
import FeedContext from "@/contexts/Feed"

function FetchedCommentsList() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { networkStats } = React.useContext(NetworkContext)
    const { data } = React.useContext(MomentContext)
    const { collapse } = React.useContext(BottomSheetContext)
    const { commentEnabled } = React.useContext(FeedContext)

    const [page, setPage] = React.useState<number>(1)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [endReached, setEndReached] = React.useState<boolean>(false)
    const pageSize = 4

    // Animate input position based on keyboard height
    const keyboardHeight = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        const showListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => {
                const offset = 0
                Animated.timing(keyboardHeight, {
                    toValue: e.endCoordinates.height - offset,
                    duration: Platform.OS === "ios" ? 250 : 200,
                    useNativeDriver: false,
                }).start()
            },
        )
        const hideListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                Animated.timing(keyboardHeight, {
                    toValue: 0,
                    duration: Platform.OS === "ios" ? 250 : 200,
                    useNativeDriver: false,
                }).start()
            },
        )

        return () => {
            showListener.remove()
            hideListener.remove()
        }
    }, [])

    const titleContainer: ViewStyle = {
        alignSelf: "center",
        alignItems: "center",
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings["1sm"],
        marginBottom: sizes.margins["2sm"],
        height: sizes.headers.height * 0.8,
        justifyContent: "center",
    }

    const title: TextStyle = {
        alignSelf: "center",
        fontSize: fonts.size.body * 1.1,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white,
    }

    const endText: TextStyle = {
        alignSelf: "center",
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: colors.gray.white,
    }

    async function fetchData() {
        if (data.id) {
            await data.getComments({ page, pageSize }).then(function (response: any) {
                const totalPages = Number(response?.data?.totalPages ?? 1)
                setEndReached(page >= totalPages)
                setPage((prev) => prev + 1)
            })
        }
    }

    React.useEffect(() => {
        if (data.id) {
            setLoading(true)
            if (data.id)
                fetchData().finally(() => {
                    setLoading(false)
                })
        }
    }, [data.id])

    React.useEffect(() => {
        // Temporariamente desabilitado para usar dados mock
        fetchData()
    }, [networkStats])

    if (networkStats == "OFFLINE" && data.comments.length == 0)
        return <OfflineCard height={sizes.screens.height - sizes.headers.height} />
    if (loading)
        return (
            <Loading.Container width={sizes.screens.width}>
                <Loading.ActivityIndicator />
            </Loading.Container>
        )

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                showsVerticalScrollIndicator={false}
                onEndReached={async () => {
                    if (!endReached && !loading) {
                        setLoading(true)
                        await fetchData().finally(() => setLoading(false))
                    }
                }}
                scrollEventThrottle={16}
                onEndReachedThreshold={0.1}
                scrollEnabled={true}
                data={data.comments}
                keyExtractor={(item: CommentObject, index: number) => String(item.id || index)}
                ListHeaderComponent={() => (
                    <View style={titleContainer}>
                        <Text style={title}>
                            {data.metrics?.totalComments} {t("Comments")}
                        </Text>
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <Reanimated.View
                        style={{
                            width: "100%",
                            alignSelf: "center",
                            alignItems: "center",
                            paddingHorizontal: sizes.paddings["1md"],
                            paddingBottom: sizes.paddings["1md"],
                        }}
                        entering={FadeInUp.duration(250)}
                    >
                        <RenderComment preview={false} comment={item} index={index} />
                    </Reanimated.View>
                )}
                ListFooterComponent={() => {
                    if (endReached) {
                        if (data.comments.length == 0)
                            return <Text style={endText}>{t("No one has commented yet.")}</Text>
                        else return <Text style={endText}>{t("No more comments.")}</Text>
                    } else return <Loading.ActivityIndicator size={25} />
                }}
                style={{ alignSelf: "center", flex: 1 }}
                contentContainerStyle={{
                    paddingBottom: sizes.inputs.height + sizes.margins["2md"],
                }}
            />
        </View>
    )
}

export default FetchedCommentsList
