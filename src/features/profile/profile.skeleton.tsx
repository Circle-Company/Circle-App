import React from "react"
import { View, ViewStyle } from "react-native"
import { Skeleton } from "../../components/skeleton"
import sizes from "../../constants/sizes"
import { StretchInX } from "react-native-reanimated"

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
                    width: 180,
                    height: 15,
                    marginTop: sizes.margins["1md"] * 1.3,
                    marginBottom: sizes.margins["1md"],
                    borderRadius: 3,
                }}
            />
        </View>
    )
}
