import React from "react"
import { View, ViewStyle } from "react-native"
import { Skeleton } from "../../components/skeleton"
import sizes from "../../constants/sizes"

export function RenderProfileSkeleton() {
    const container: ViewStyle = {
        paddingTop: sizes.paddings["1md"],
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "flex-start",
    }

    return (
        <View style={container}>
            <Skeleton.View style={{ width: 200, height: 200, borderRadius: 200 / 2 }} />

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
