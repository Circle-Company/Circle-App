import React from "react"
import { View } from "../../../components/Themed"
import PersistedContext from "../../../contexts/Persisted"
import AccountContext from "../../../contexts/account"
import ListMemories from "../../../features/list-memories/list-memories-preview"
import RenderProfile from "../../../features/render-profile"
import { RenderProfileSkeleton } from "../../../features/render-profile/skeleton"
import { AnimatedVerticalScrollView } from "../../../lib/hooks/useAnimatedScrollView"

export default function AccountScreen() {
    const { setRefreshing, refreshing } = React.useContext(AccountContext)
    const { session } = React.useContext(PersistedContext)
    const [loading, setLoading] = React.useState(false)

    async function fetchData() {
        setLoading(true)
        await session.user.get(session.user.id)
        await session.statistics.get(session.user.id).finally(() => {
            setTimeout(() => {
                setLoading(false)
                setRefreshing(false)
            }, 200)
        })
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchData()
    }

    React.useEffect(() => {
        if (!session.user) setLoading(true)
        else setLoading(false)
    }, [])

    const renderUser = {
        ...session.user,
        statistics: {
            ...session.statistics,
        },
    }

    return (
        <View>
            <AnimatedVerticalScrollView
                onEndReachedThreshold={0.1}
                handleRefresh={handleRefresh}
                onEndReached={fetchData}
                endRefreshAnimationDelay={400}
                showRefreshSpinner={false}
            >
                {loading ? <RenderProfileSkeleton /> : <RenderProfile user={renderUser} />}
                <ListMemories
                    userRefreshing={refreshing}
                    isAccountScreen={true}
                    user={session.user}
                />
            </AnimatedVerticalScrollView>
        </View>
    )
}
