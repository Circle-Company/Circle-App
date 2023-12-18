import React from "react"
import { View, Text } from "react-native"
import { MomentContainerProps } from "../moment-types"
import { useMomentContext } from "../moment-context"
import sizes from "../../../layout/constants/sizes"
import ColorTheme from "../../../layout/constants/colors"
import { MidiaRender } from "../../midia_render"
import { MidiaReciveDataProps } from "../../midia_render/midia_render-types"

export default function scontainer ({children, contentRender, focused}: MomentContainerProps) {
    const { momentSizes } = useMomentContext()

    const container:any = {
        ...momentSizes,
        overflow: 'hidden',
        borderRadius: momentSizes.borderRadius,
        backgroundColor: ColorTheme().backgroundDisabled,
        zIndex: 1
    }
    const content_container:any = {
        position: 'absolute',
        width: momentSizes.width,
        height: momentSizes.height,
        zIndex: 0
    }
    if(focused) {
        return (
            <View style={container}>
                <View style={content_container}>
                    <MidiaRender.Root data={contentRender} content_sizes={momentSizes}>
                        <MidiaRender.RenderImage/>  
                    </MidiaRender.Root>
                </View>
                {children}
            </View>
        )
    }else {
        return (
            <View style={container}>
                <View style={content_container}>
                <MidiaRender.Root data={contentRender} content_sizes={momentSizes}>
                <MidiaRender.RenderImage blur={focused? false: true}/>  
                </MidiaRender.Root>
                </View>
            </View>
        )
    }
    

}