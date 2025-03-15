import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import { MidiaRender } from "../../midia_render"
import { MemoryContainerProps } from "../memory-types"

export default function container({
    children,
    contentRender,
    focused,
    contentSizes = sizes.moment.tiny,
}: MemoryContainerProps) {
    const container: any = {
        ...sizes.moment.tiny,
        overflow: "hidden",
        borderRadius: sizes.moment.tiny.borderRadius,
        backgroundColor: ColorTheme().backgroundDisabled,
        zIndex: 1,
    }
    const content_container: any = {
        position: "absolute",
        width: sizes.moment.tiny,
        height: sizes.moment.tiny,
        zIndex: 0,
    }

    return (
        <View style={container}>
            <View style={content_container}>
                <MidiaRender.Root data={contentRender} content_sizes={contentSizes}>
                    <MidiaRender.RenderImage blur={focused} blurRadius={18} />
                </MidiaRender.Root>
            </View>

            {children}
        </View>
    )
}
