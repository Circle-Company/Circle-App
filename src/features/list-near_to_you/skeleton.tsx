import { View } from "../../components/Themed"
import { Skeleton } from "../../components/skeleton"
import sizes from "../../layout/constants/sizes"

export function ListNearToYouSkeleton() {
    const container = {
        padding: sizes.paddings["1md"],
        width: sizes.screens.width,
    }

    const itemContainer = {
        marginBottom: sizes.margins["1md"],
        flexDirection: "row" as const,
        alignItems: "center" as const,
        padding: 10,
        borderRadius: 8,
    }

    return (
        <View style={container}>
            {Array.from({ length: 8 }).map((_, index) => (
                <View key={index} style={itemContainer}>
                    {/* Foto de perfil */}
                    <Skeleton.View
                        duration={2000}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                    />

                    <View style={{ marginLeft: 10 }}>
                        {/* Nome de usuário */}
                        <Skeleton.View
                            duration={2000}
                            style={{
                                width: 120,
                                height: 16,
                                borderRadius: 8,
                                marginBottom: 6,
                            }}
                        />

                        {/* Distância */}
                        <Skeleton.View
                            duration={2000}
                            style={{
                                width: 60,
                                height: 12,
                                borderRadius: 6,
                            }}
                        />
                    </View>
                </View>
            ))}
        </View>
    )
}
