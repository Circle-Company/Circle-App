import { Skeleton } from "@/components/skeleton"
import { View } from "@/components/Themed"
import sizes from "@/layout/constants/sizes"
import { ViewStyle } from "react-native"

export function ListNearToYouSkeleton() {
    const container: ViewStyle = {
        padding: sizes.paddings["1md"],
        width: sizes.screens.width,
    }

    const itemContainer: ViewStyle = {
        marginBottom: sizes.margins["1md"],
        flexDirection: "row" as const,
        alignItems: "center" as const,
        padding: 10,
        borderRadius: 8,
    }

    const usernameSkeletonStyle: ViewStyle = {
        width: 120,
        height: 16,
        borderRadius: 8,
        marginBottom: 6,
    }

    const distanceSkeletonStyle: ViewStyle = {
        width: 60,
        height: 12,
        borderRadius: 6,
    }

    const profilePictureSkeletonStyle: ViewStyle = {
        width: 40,
        height: 40,
        borderRadius: 20,
    }

    const contentContainerStyle: ViewStyle = {
        marginLeft: 10
    }

    return (
        <View style={container}>
            {Array.from({ length: 8 }).map((_, index) => (
                <View key={index} style={itemContainer}>
                    {/* Foto de perfil */}
                    <Skeleton.View
                        duration={2000}
                        style={profilePictureSkeletonStyle}
                    />
                </View>
            ))}
        </View>
    )
}
