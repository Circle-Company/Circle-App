import React from "react"
import { View, Text } from "@/components/Themed"
import NearContext from "@/contexts/near"
import { useNavigation } from "@react-navigation/native"
import { ListNearToYouSkeleton } from "./skeleton"
import { AnimatedVerticalFlatlist } from "@/lib/hooks/useAnimatedFlatList"
import { EmptyList } from "./render-empty_list"
import { useSearchContext } from "@/components/search/search-context"
import mockNearbyUsers from "@/mock-data/near_users.json"
import { NearToYou } from "@/components/near_to_you"
import { RenderFooter } from "./render-footer"
import sizes from "@/layout/constants/sizes"
import CircleIcon from "@/assets/icons/svgs/circle-spinner.svg"
import { colors } from "@/layout/constants/colors"

export default function ListNearToYou() {
    const { searchTerm } = useSearchContext()
    const navigation = useNavigation()
    const {
        nearbyUsers,
        loading,
        refreshing,
        refreshNearbyUsers = () => Promise.resolve(),
        loadMoreUsers = () => Promise.resolve(),
        hasMorePages,
        error,
    } = React.useContext(NearContext) || {}

    React.useEffect(() => {
        navigation.setOptions({
            title: "Near to You",
            headerRight: () => (
                <Text onPress={refreshNearbyUsers} style={{ marginRight: 15, color: "#007AFF" }}>
                    Reload
                </Text>
            ),
        })
    }, [navigation])

    if (searchTerm) return null

    if (loading && !refreshing) {
        return <ListNearToYouSkeleton />
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "red" }}>{error}</Text>
            </View>
        )
    }

    const CustomRefreshIcon = () => {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Near to You</Text>
            </View>
        )
    }

    function RenderHeader() {
        return (
            <View
                style={{
                    height: sizes.headers.height,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>Near to You</Text>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <AnimatedVerticalFlatlist
                CustomRefreshIcon={() => (
                    <CircleIcon width={26} height={26} fill={colors.gray.grey_06} />
                )}
                data={mockNearbyUsers}
                skeleton={<ListNearToYouSkeleton />}
                handleRefresh={refreshNearbyUsers}
                onEndReached={loadMoreUsers}
                onEndReachedThreshold={100}
                ListHeaderComponent={() => <RenderHeader />}
                ListFooterComponent={() => <RenderFooter hasMorePages={hasMorePages} />}
                ListEmptyComponent={EmptyList}
                showRefreshSpinner={false}
                renderItem={({ item }) => <NearToYou.RenderUser user={item} />}
            />
        </View>
    )
}
