import { AnimatedVerticalFlatlist } from "@/lib/hooks/useAnimatedFlatList"
import CircleIcon from "@/assets/icons/svgs/circle-spinner.svg"
import { EmptyList } from "./render-empty"
import { ListNearToYouSkeleton } from "./render-skeleton"
import { NearToYou } from "@/components/near_to_you"
import React from "react"
import { RenderError } from "./render-error"
import { RenderFooter } from "./render-footer"
import { RenderHeader } from "./render-header"
import { View } from "@/components/Themed"
import { ViewStyle } from "react-native"
import { colors } from "@/layout/constants/colors"
import sizes from "@/layout/constants/sizes"
import { useNearContext } from "@/contexts/near"
import { useSearchContext } from "@/components/search/search-context"

export default function ListNearToYou() {
    const { searchTerm } = useSearchContext()
    const {
        nearbyUsers,    
        loading,
        error,
        getNearbyUsers,
    } = useNearContext()

    React.useEffect(() => {
        getNearbyUsers()
    }, [])

    // Função para atualizar a lista
    const handleRefresh = React.useCallback(async () => {
        try {
            await getNearbyUsers()
        } catch (error) {
            console.error("Erro ao atualizar lista:", error)
        }
    }, [getNearbyUsers])

    // Memoize o renderItem para evitar recriações desnecessárias
    const renderItem = React.useCallback(({ item }) => (
        <NearToYou.RenderUser 
            user={{
                ...item,
                profile_picture: { tiny_resolution: item.profile_picture.tiny_resolution},
                id: String(item.id),
                you_follow: item.you_follow ?? false,
                follow_you: item.follow_you ?? false,
                distance_km: item.distance_km ?? 0
            }} 
        />
    ), [])

    // Memoize os componentes de lista
    const ListHeader = React.useCallback(() => <RenderHeader />, [])
    const ListFooter = React.useCallback(() => <RenderFooter />, [])
    const ListEmpty = React.useCallback(() => <EmptyList />, [])
    const ListSkeleton = React.useCallback(() => <ListNearToYouSkeleton />, [])
    const ListError = React.useCallback(() => <RenderError />, [])

    const containerStyle: ViewStyle = {
        marginTop: sizes.margins["2sm"],
        height: "100%",
        overflow: "hidden",
    }

    // Renderização condicional otimizada
    if (searchTerm) {
        return null
    }

    if (error) {
        return <ListError />
    }

    if (loading && !nearbyUsers?.length) {
        return <ListSkeleton />
    }

    return (
        <View style={containerStyle}>
            <AnimatedVerticalFlatlist
                CustomRefreshIcon={() => (
                    <CircleIcon width={26} height={26} fill={colors.gray.grey_06} />
                )}
                data={nearbyUsers || []}
                skeleton={<ListSkeleton />}
                handleRefresh={handleRefresh}
                onEndReached={async () => { return Promise.resolve() }}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                ListEmptyComponent={ListEmpty}
                showRefreshSpinner={false}
                renderItem={renderItem}
                isLoading={loading}
            />
        </View>
    )
}
