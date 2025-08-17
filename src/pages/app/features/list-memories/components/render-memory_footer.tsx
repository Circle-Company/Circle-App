import React from "react"
import { View } from "react-native"
import { Loading } from "../../../../../components/loading"
import sizes from "../../../../../constants/sizes"

export default function render_memory_footer() {
    const container: any = {
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
