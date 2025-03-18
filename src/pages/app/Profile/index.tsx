import ProfileHeader from "@/components/headers/profile/profile-header"
import { RenderProfileSkeleton } from "@/features/render-profile/skeleton"
import { RouteProp, useRoute } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import ViewProfileContext from "../../../contexts/viewProfile"
import ListMemories from "../../../features/list-memories/list-memories-preview"
import RenderProfile from "../../../features/render-profile"
import { AnimatedVerticalScrollView } from "../../../lib/hooks/useAnimatedScrollView"

type ProfileScreenRouteParams = {
    findedUserPk: string
}

type ProfileScreenRouteProp = RouteProp<{ Profile: ProfileScreenRouteParams }, "Profile">

export default function ProfileScreen() {
    const { useUserProfile, userProfile } = React.useContext(ViewProfileContext)
    const route = useRoute<ProfileScreenRouteProp>()
    // Se não existir o parâmetro, pode exibir uma mensagem de erro ou redirecionar

    const { data, isLoading, isError, isRefetching, refetch, isFetched } = useUserProfile(
        route.params.findedUserPk
    )

    const container = {
        top: 0,
    }

    React.useEffect(() => {
        refetch
    }, [])

    const handleRefresh = async () => {
        try {
            await refetch()
        } catch (error) {
            console.error("Erro ao atualizar o perfil:", error)
        }
    }

    if (isLoading || !isFetched) {
        return (
            <View style={container}>
                <ProfileHeader />
                <RenderProfileSkeleton />
            </View>
        )
    } else
        return (
            <View style={container}>
                <ProfileHeader />
                <AnimatedVerticalScrollView
                    onEndReachedThreshold={0.1}
                    handleRefresh={handleRefresh}
                    endRefreshAnimationDelay={400}
                    showRefreshSpinner={false}
                    onEndReached={async () => await handleRefresh()}
                >
                    <RenderProfile user={data} />
                    <ListMemories
                        userRefreshing={isRefetching}
                        isAccountScreen={false}
                        user={data}
                    />
                </AnimatedVerticalScrollView>
            </View>
        )
}
