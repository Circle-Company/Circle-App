import React from "react"
import { View, Text, Pressable } from "react-native"
import { MomentContainerProps } from "../moment-types"
import { useMomentContext } from "../moment-context"
import ColorTheme from "../../../layout/constants/colors"
import { MidiaRender } from "../../midia_render"
import { analytics } from "../../../services/Analytics"

export default function scontainer ({children, contentRender, focused}: MomentContainerProps) {
    const { momentSizes, moment} = useMomentContext()

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
        zIndex: 0,
    }

    async function onPressed() {
        analytics.setEventPrefix('moment')
        analytics.setUserId('19397179319')
        analytics.trackEvent('click_into_moment', {moment_id: moment.id} )
        console.log(analytics.data)
    }

    if(focused) {
        return (
            <View style={container}>
                <Pressable onPress={onPressed} style={content_container}>
                    <MidiaRender.Root data={contentRender} content_sizes={momentSizes}>
                        <MidiaRender.RenderImage/>  
                    </MidiaRender.Root>
                </Pressable>
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