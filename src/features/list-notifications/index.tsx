import React from "react"
import { useColorScheme } from "react-native"
import OfflineCard from "../../components/general/offline"
import { Loading } from "../../components/loading"
import PersistedContext from "../../contexts/Persisted"
import LanguageContext from "../../contexts/Preferences/language"
import NetworkContext from "../../contexts/network"
import { TimeInterval, groupObjectsByDate } from "../../helpers/separateArrByDate"
import sizes from "../../layout/constants/sizes"
import { AnimatedVerticalFlatlist } from "../../lib/hooks/useAnimatedFlatList"
import api from "../../services/Api"
import EndReached from "../list-memories/list-memories-all/components/end-reached"
import { ListNotificationsAll } from "./list-notifications-date_group"
import { ListNotificationsSkeleton } from "./skeleton"
export default function ListNotifcations() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const [notificationsData, setNotificationsData]: any = React.useState([])

    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(6)
    const [loading, setLoading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [endReached, setEndReached] = React.useState(false)
    const isDarkMode = useColorScheme() === "dark"
    const { networkStats } = React.useContext(NetworkContext)

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        await api
            .get(`/notification/find?page=${page}&pageSize=${pageSize}`, {
                headers: { Authorization: session.account.jwtToken },
            })
            .then(function (response) {
                if (page === 1) setNotificationsData(response.data.notifications)
                else {
                    setNotificationsData([...notificationsData, ...response.data.notifications])
                    if (pageSize > response.data.notifications.length) setEndReached(true)
                    else setEndReached(false)
                }
                session.account.setUnreadNotificationsCount(0)
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
            setTimeout(() => {
                setLoading(false)
                setRefreshing(false)
            }, 200)
        })
    }

    const data_to_render = groupObjectsByDate(notificationsData, TimeInterval.DAY)

    if (networkStats == "OFFLINE")
        return <OfflineCard height={sizes.screens.height - sizes.headers.height} />
    return (
        <AnimatedVerticalFlatlist
            data={data_to_render}
            onEndReached={async () => {
                await fetchData()
            }}
            isLoading={loading}
            skeleton={<ListNotificationsSkeleton />}
            showRefreshSpinner={false}
            onEndReachedThreshold={0.1}
            handleRefresh={async () => await handleRefresh()}
            renderItem={({ item, index }) => {
                return (
                    <ListNotificationsAll
                        key={index}
                        data={item}
                        date_text={item.date}
                        count={item.count}
                    />
                )
            }}
            ListFooterComponent={() => {
                if (endReached)
                    return (
                        <EndReached
                            text={t("Notifications older than 15 days are automatically deleted")}
                        />
                    )
                else
                    return (
                        <Loading.Container
                            width={sizes.screens.width}
                            height={sizes.headers.height * 2}
                        >
                            <Loading.ActivityIndicator />
                        </Loading.Container>
                    )
            }}
        />
    )
}
