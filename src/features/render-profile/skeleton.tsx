import React from "react"
import { View, ViewStyle } from "react-native"
import { Skeleton } from "../../components/skeleton"
import sizes from "../../layout/constants/sizes"

export function RenderProfileSkeleton() {
    const container: ViewStyle = {
        paddingTop: sizes.paddings["1md"],
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "flex-start",
    }

    const statisticsContainer: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1xl"] * 0.6,
    }

    const statistic: ViewStyle = {
        width: sizes.screens.width / 4,
        alignItems: "center",
        justifyContent: "center",
    }
    return (
        <View style={container}>
            <Skeleton.View style={{ width: 130, height: 130, borderRadius: 130 / 2 }} />
            <Skeleton.View
                style={{
                    alignSelf: "center",
                    width: 80,
                    height: 15,
                    marginTop: 15,
                    borderRadius: 3,
                }}
            />

            <View style={statisticsContainer}>
                <View style={statistic}>
                    <Skeleton.View
                        style={{
                            width: 260,
                            height: 45,
                            borderRadius: 45 / 2,
                        }}
                    />
                </View>
            </View>

            <Skeleton.View
                style={{
                    alignSelf: "center",
                    width: 140,
                    height: 15,
                    marginTop: sizes.margins["1md"],
                    borderRadius: 3,
                }}
            />
            <Skeleton.View
                style={{
                    alignSelf: "center",
                    width: 90,
                    height: 15,
                    marginTop: 10,
                    borderRadius: 3,
                }}
            />
        </View>
    )
}
