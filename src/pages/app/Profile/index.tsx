import { RouteProp, useRoute } from "@react-navigation/native"
import { View, ViewStyle } from "react-native"

import { AnimatedVerticalScrollView } from "../../../lib/hooks/useAnimatedScrollView"
import CircleIcon from "@/assets/icons/svgs/circle-spinner.svg"
import ProfileHeader from "../../../components/headers/profile/profile-header"
import React from "react"
import RenderProfile from "../../../features/render-profile"
import { RenderProfileSkeleton } from "../../../features/render-profile/skeleton"
import { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import ProfileContext from "@/contexts/profile"

type ProfileScreenRouteParams = {
    findedUserPk: string
}

type ProfileScreenRouteProp = RouteProp<{ Profile: ProfileScreenRouteParams }, "Profile">

export default function ProfileScreen() {
    const { getUser, user } = React.useContext(ProfileContext)
    const [isLoading, setIsLoading] = React.useState(true)
    const route = useRoute<ProfileScreenRouteProp>()

    async function handleGetProfile() {
        await getUser(route.params.findedUserPk)
            .then(() => {
                setIsLoading(false)
            })
            .catch((error) => {
                console.error("Erro ao buscar perfil:", error)
                setIsLoading(false)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }
    // Se não existir o parâmetro, pode exibir uma mensagem de erro ou redirecionar

    React.useEffect(() => {
        handleGetProfile()
    }, [route.params.findedUserPk])

    const container: ViewStyle = {
        top: 0,
        height: sizes.screens.height + sizes.headers.height,
        overflow: "hidden" as const,
    }

    const handleRefresh = async () => {
        try {
            await handleGetProfile()
        } catch (error) {
            console.error("Erro ao atualizar o perfil:", error)
        }
    }

    if (isLoading || !user) {
        return (
            <View style={container}>
                <ProfileHeader />
                <RenderProfileSkeleton />
            </View>
        )
    } else {
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
                    <RenderProfile user={user as any} />
                </AnimatedVerticalScrollView>
            </View>
        )
    }
}
