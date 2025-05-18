import CircleIcon from "@/assets/icons/svgs/circle-spinner.svg"
import { NearToYou } from "@/components/near_to_you"
import { useSearchContext } from "@/components/search/search-context"
import { View } from "@/components/Themed"
import NearContext from "@/contexts/near"
import { colors } from "@/layout/constants/colors"
import { AnimatedVerticalFlatlist } from "@/lib/hooks/useAnimatedFlatList"
import React from "react"
import { ViewStyle } from "react-native"
import { EmptyList } from "./render-empty"
import { RenderError } from "./render-error"
import { RenderFooter } from "./render-footer"
import { RenderHeader } from "./render-header"
import { ListNearToYouSkeleton } from "./render-skeleton"

export default function ListNearToYou() {
    const { searchTerm } = useSearchContext()
    const {
        nearbyUsers,
        getNearbyUsers,
        loading,
        error,
    } = React.useContext(NearContext) || {}

    const containerStyle: ViewStyle = {
        flex: 1
    }

    if (searchTerm) return null

    if (loading) {
        return <ListNearToYouSkeleton />
    }

    if (error) {
        return (
            <RenderError/>
        )
    }

    return (
        <View style={containerStyle}>
            <AnimatedVerticalFlatlist
                CustomRefreshIcon={() => (
                    <CircleIcon width={26} height={26} fill={colors.gray.grey_06} />
                )}
                data={nearbyUsers}
                skeleton={<ListNearToYouSkeleton />}
                handleRefresh={getNearbyUsers}
                onEndReached={getNearbyUsers}
                onEndReachedThreshold={100}
                ListHeaderComponent={() => <RenderHeader/>}
                ListFooterComponent={() => <RenderFooter/>}
                ListEmptyComponent={EmptyList}
                showRefreshSpinner={false}
                renderItem={({ item }) => (
                    <NearToYou.RenderUser 
                        user={{
                            ...item,
                            id: String(item.id),
                            you_follow: item.you_follow ?? false,
                            follow_you: item.follow_you ?? false,
                            distance_km: item.distance_km ?? 0
                        }} 
                    />
                )}
            />
        </View>
    )
}
