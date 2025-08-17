import React from "react"
import { View, useColorScheme } from "react-native"
import sizes from "../../../layout/constants/sizes"
import { Loading } from "../../../components/loading"

type RenderMemoryFooterProps = {}

export default function render_memory_footer({}: RenderMemoryFooterProps) {
    const isDarkMode = useColorScheme() === "dark"

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
