import { useIsFocused } from "@react-navigation/native"
import React from "react"
import { RefreshControl, ScrollView, useColorScheme } from "react-native"
import { Loading } from "../../../components/loading"
import { View } from "../../../components/Themed"
import BottomTabsContext from "../../../contexts/bottomTabs"
import PersistedContext from "../../../contexts/Persisted"
import ListMemories from "../../../features/list-memories/list-memories-preview"
import RenderProfile from "../../../features/render-profile"
import { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"

export default function AccountScreen() {
    const { session } = React.useContext(PersistedContext)
    const { setCurrentTab } = React.useContext(BottomTabsContext)
    const [refreshing, setRefreshing] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const isDarkMode = useColorScheme() === "dark"
    const isFocused = useIsFocused()

    React.useEffect(() => {
        setCurrentTab("Account")
    }, [isFocused])

    const container = {
        top: 0,
    }

    const handleRefresh = () => {
        setLoading(true)
        session.user.get(session.user.id)
        session.statistics.get(session.user.id).finally(() => {
            setTimeout(() => {
                setLoading(false)
                setRefreshing(false)
            }, 200)
        })
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
        <View style={container}>
            <ScrollView
                style={container}
                showsVerticalScrollIndicator={false}
                horizontal={false}
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
            >
                {loading ? (
                    <Loading.Container
                        width={sizes.screens.width}
                        height={sizes.screens.height / 3}
                    >
                        <Loading.ActivityIndicator />
                    </Loading.Container>
                ) : (
                    <RenderProfile user={renderUser} />
                )}
                <ListMemories isAccountScreen={true} user={session.user} />
            </ScrollView>
        </View>
    )
}
