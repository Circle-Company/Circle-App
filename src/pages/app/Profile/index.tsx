import { RouteProp, useRoute } from "@react-navigation/native"
import { View, ViewStyle } from "react-native"

import { AnimatedVerticalScrollView } from "../../../lib/hooks/useAnimatedScrollView"
import CircleIcon from "@/assets/icons/svgs/circle-spinner.svg"
import ListMemories from "../../../features/list-memories/list-memories-preview"
import ProfileHeader from "@/components/headers/profile/profile-header"
import React from "react"
import RenderProfile from "../../../features/render-profile"
import { RenderProfileSkeleton } from "@/features/render-profile/skeleton"
import ViewProfileContext from "../../../contexts/viewProfile"
import { colors } from "@/layout/constants/colors"
import sizes from "@/layout/constants/sizes"

type ProfileScreenRouteParams = {
    findedUserPk: string
}

type ProfileScreenRouteProp = RouteProp<{ Profile: ProfileScreenRouteParams }, "Profile">

export default function ProfileScreen() {
    const { useUserProfile } = React.useContext(ViewProfileContext)
    const route = useRoute<ProfileScreenRouteProp>()
    // Se não existir o parâmetro, pode exibir uma mensagem de erro ou redirecionar

    const { data, isLoading, isRefetching, refetch, isFetched } = useUserProfile(
        route.params.findedUserPk
    )

    const container: ViewStyle = {
        top: 0,
        height: sizes.screens.height + sizes.headers.height,
        overflow: "hidden" as const,
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

    if (isLoading || !isFetched || !data) {
        return (
            <View style={container}>
                <ProfileHeader />
                <RenderProfileSkeleton />
            </View>
        )
    } else {
        // Garantir que o profile_picture tem o formato correto
        const userData = {
            ...data,
            profile_picture: {
                ...data.profile_picture,
                small_resolution: data.profile_picture.tiny_resolution
            }
        }

        return (
            <View style={container}>
                <ProfileHeader />
                <AnimatedVerticalScrollView
                    onEndReachedThreshold={0.1}
                    handleRefresh={handleRefresh}
                    endRefreshAnimationDelay={400}
                    showRefreshSpinner={false}
                    onEndReached={async () => await handleRefresh()}
                    CustomRefreshIcon={() => (
                        <CircleIcon width={26} height={26} fill={colors.gray.grey_06} />
                    )}
                >
                    <RenderProfile user={userData} />
                    <ListMemories
                        isAccountScreen={false}
                        user={userData}
                    />
                </AnimatedVerticalScrollView>
            </View>
        )
    }
}
