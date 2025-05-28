import Reanimated, { FadeInUp } from "react-native-reanimated"

import PersistedContext from "@/contexts/Persisted"
import LanguageContext from "@/contexts/Preferences/language"
import React from "react"
import { FlatList } from "react-native"
import NetworkContext from "../../../contexts/network"
import EndReached from "../../../features/list-memories/list-memories-preview/components/end-reached"
import sizes from "../../../layout/constants/sizes"
import api from "../../../services/Api"
import OfflineCard from "../../general/offline"
import { Loading } from "../../loading"
import MomentContext from "../../moment/context"
import { useCommentsContext } from "../comments-context"
import { CommentObject } from "../comments-types"
import RenderComment from "./comments-render_comment"
import ZeroComments from "./comments-zero_comments"

export default function ListComments() {
    const { comment, preview } = useCommentsContext()
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { networkStats } = React.useContext(NetworkContext)
    const [page, setPage] = React.useState<number>(1)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [endReached, setEndReached] = React.useState<boolean>(false)
    const [allComments, setAllComments] = React.useState<CommentObject[]>([])
    
    // Verificar se o MomentContext está disponível
    let momentData: any = null
    try {
        const momentContext = React.useContext(MomentContext)
        momentData = momentContext?.momentData
    } catch (error) {
        // MomentContext não está disponível, usar apenas dados do preview
    }
    
    const pageSize = 4

    async function fetchData() {
        if (!momentData?.id) {
            return
        }
        
        await api
            .get(`/moments/${momentData.id}/comments?page=${page}&pageSize=${pageSize}`, {
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
            })
    }

    React.useEffect(() => {
        if (preview == false && momentData?.id) {
            setLoading(true)
            if (momentData.id && momentData.id !== "0")
                fetchData().finally(() => {
                    setLoading(false)
                })
        }
    }, [momentData?.id])

    React.useEffect(() => {
        if (preview == false && momentData?.id) fetchData()
    }, [networkStats])

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

    const dataToRender = preview ? comment : allComments

    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            onEndReached={async () => {
                if (!preview && momentData?.id) {
                    await fetchData()
                }
            }}
            scrollEventThrottle={16}
            onEndReachedThreshold={0.1}
            scrollEnabled={false}
            data={dataToRender}
            keyExtractor={(item: CommentObject, index: number) => String(item.id || index)}
            renderItem={({ item, index }) => {
                return (
                    <Reanimated.View
                        style={{width: "95%", alignSelf: "center"}}
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
                if (preview && comment?.length == 0) {
                    return <ZeroComments />
                }
            }}
            style={{ width: sizes.moment.standart.width, alignSelf: "center" }}
        />
    )
}
