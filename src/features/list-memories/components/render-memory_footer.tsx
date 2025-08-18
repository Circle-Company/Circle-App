import React from "react"
import { View, ViewStyle } from "react-native"
import { Loading } from "../../../components/loading"
import sizes from "../../../constants/sizes"

export default function RenderMemoryFooter() {
    const container: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        height: sizes.moment.tiny.height,
    }

    return (
        <View style={container}>
            <Loading.Container height={sizes.moment.tiny.height} width={sizes.sizes["1lg"] * 1.6}>
                <Loading.ActivityIndicator />
            </Loading.Container>
        </View>
    )
}
