import React from "react"
import { View } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import MidiaRenderContext from "../midia_render-context"
import { MidiaRenderMainRootProps } from "../midia_render-types"

export default function root({ children, data, content_sizes }: MidiaRenderMainRootProps) {
    const container: any = {
        width: content_sizes.width,
        height: content_sizes.height,
        zIndex: 0,
    }
    const superior_gradient: any = {
        width: content_sizes.width,
        height: content_sizes.height / 6,
        position: "absolute",
        zIndex: 1,
        top: 0,
    }

    const inferior_gradient: any = {
        width: content_sizes.width,
        height: content_sizes.height / 3,
        position: "absolute",
        zIndex: 1,
        bottom: 0,
    }
    return (
        <MidiaRenderContext.Provider value={{ midia: data, content_sizes: content_sizes }}>
            <LinearGradient colors={["#00000060", "#00000000"]} style={superior_gradient} />
            <LinearGradient colors={["#00000000", "#00000040"]} style={inferior_gradient} />
            <View style={container}>{children}</View>
        </MidiaRenderContext.Provider>
    )
}
