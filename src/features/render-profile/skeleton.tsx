import { View } from "../../components/Themed"
import { Skeleton } from "../../components/skeleton"
import sizes from "../../layout/constants/sizes"

export function RenderProfileSkeleton() {
    const container = {
        paddingTop: sizes.paddings["1md"],
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "flex-start",
    }

    const statisticsContainer = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1xl"] * 0.6,
    }

    const statistic = {
        width: sizes.screens.width / 4,
        alignItems: "center",
        justifyContent: "center",
    }
    return (
        <View style={container}>
            <Skeleton.View style={{ width: 100, height: 100, borderRadius: 50 }} />
            <Skeleton.View
                style={{
                    width: 100,
                    height: 20,
                    borderRadius: 10,
                    marginTop: sizes.margins["1md"],
                }}
            />

            <View style={statisticsContainer}>
                <View style={statistic}>
                    <Skeleton.View
                        style={{
                            width: 70,
                            height: 22,
                            borderRadius: 11,
                        }}
                    />
                </View>
                <View style={statistic}>
                    <Skeleton.View
                        style={{
                            width: 70,
                            height: 22,
                            borderRadius: 11,
                        }}
                    />
                </View>
                <View style={statistic}>
                    <Skeleton.View
                        style={{
                            width: 70,
                            height: 22,
                            borderRadius: 11,
                        }}
                    />
                </View>
            </View>

            <Skeleton.View
                style={{
                    alignSelf: "center",
                    width: 100,
                    height: 15,
                    marginTop: sizes.margins["1lg"],
                    borderRadius: 3,
                }}
            />
            <Skeleton.View
                style={{
                    alignSelf: "center",
                    width: 180,
                    height: 15,
                    marginTop: 10,
                    borderRadius: 3,
                }}
            />
            <Skeleton.View
                style={{
                    alignSelf: "center",
                    width: 150,
                    height: 15,
                    marginTop: 10,
                    borderRadius: 3,
                }}
            />
        </View>
    )
}
