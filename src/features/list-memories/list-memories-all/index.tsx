import React from "react"
import { useColorScheme } from "react-native"
import OfflineCard from "../../../components/general/offline"
import LanguageContext from "../../../contexts/Preferences/language"
import MemoryContext from "../../../contexts/memory"
import NetworkContext from "../../../contexts/network"
import { TimeInterval, groupObjectsByDate } from "../../../helpers/separateArrByDate"
import sizes from "../../../layout/constants/sizes"
import { AnimatedVerticalFlatlist } from "../../../lib/hooks/useAnimatedFlatList"
import api from "../../../services/Api"
import EndReached from "./components/end-reached"
import { ListMemoriesAll } from "./components/list-memories-date_group"
import { ListMemoriesAllSkeleton } from "./skeleton"

export default function ListMemoriesAllSeparatedbyDate() {
    const { t } = React.useContext(LanguageContext)
    const { allMemoriesUser } = React.useContext(MemoryContext)
    const [allMemories, setAllMemories] = React.useState<Object[]>([])
    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(30)
    const [loading, setLoading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [endReached, setEndReached] = React.useState(false)
    const isDarkMode = useColorScheme() === "dark"
    const { networkStats } = React.useContext(NetworkContext)
    const fetchData = async () => {
        await api
            .post(`/memory/get-user-memories?page=${page}&pageSize=${pageSize}`, {
                user_id: allMemoriesUser.id,
            })
            .then(function (response) {
                if (page === 1) {
                    setAllMemories(response.data.memories)
                } else {
                    setAllMemories([...allMemories, ...response.data.memories])
                    if (pageSize > response.data.memories.length) setEndReached(true)
                    else setEndReached(false)
                }
                setPage(page + 1)
            })
            .catch(function (error) {
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
        fetchData()
    }, [networkStats])

    const handleRefresh = async () => {
        setPage(1)
        setLoading(true)
        await fetchData().finally(() => {
            setLoading(false)
            setTimeout(() => {
                setRefreshing(false)
            }, 200)
        })
    }

    const data_to_render = groupObjectsByDate(allMemories, TimeInterval.DAY)
    if (networkStats == "OFFLINE" && allMemories.length == 0)
        return <OfflineCard height={sizes.screens.height - sizes.headers.height} />
    return (
        <AnimatedVerticalFlatlist
            data={data_to_render}
            onEndReached={fetchData}
            onEndReachedThreshold={0.1}
            handleRefresh={handleRefresh}
            showRefreshSpinner={false}
            renderItem={({ item, index }) => {
                if (refreshing || loading) return <ListMemoriesAllSkeleton />
                else
                    return (
                        <ListMemoriesAll
                            key={index}
                            data={item}
                            date_text={item.date}
                            count={item.count}
                            user={allMemoriesUser}
                        />
                    )
            }}
            ListFooterComponent={() => {
                if (endReached) return <EndReached text={t("No more Memories")} />
                else if (data_to_render.length <= 0)
                    return (
                        <>
                            <ListMemoriesAllSkeleton />
                            <ListMemoriesAllSkeleton />
                            <ListMemoriesAllSkeleton />
                        </>
                    )
                else return <ListMemoriesAllSkeleton />
            }}
        />
    )
}
