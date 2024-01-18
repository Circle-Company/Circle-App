import React from "react"
import { View, Pressable} from "react-native"
import { MemoryContainerProps } from "../memory-types"
import sizes from "../../../layout/constants/sizes"
import { MidiaRender } from "../../midia_render"
import { useMemoryContext } from "../memory-context"
import ColorTheme from "../../../layout/constants/colors"
import { useNavigation } from "@react-navigation/native"

export default function container ({children, contentRender, focused}: MemoryContainerProps) {

    const navigation = useNavigation()
    const container:any = {
        ...sizes.moment.tiny,
        overflow: 'hidden',
        borderRadius: sizes.moment.tiny.borderRadius,
        backgroundColor: ColorTheme().backgroundDisabled,
        zIndex: 1
    }
    const content_container:any = {
        position: 'absolute',
        width: sizes.moment.tiny,
        height: sizes.moment.tiny,
        zIndex: 0
    }

    function pressed() {
        navigation.navigate('MemoriesNavigator',{ screen: 'Memory'})
    }

    return (
        <Pressable style={container} onPress={pressed}>
            <View style={content_container}>
                <MidiaRender.Root data={contentRender} content_sizes={sizes.moment.tiny}>
                    <MidiaRender.RenderImage blur={Boolean(focused)} blurRadius={20}/>  
                </MidiaRender.Root>                
            </View>
            {children}
        </Pressable>
    )           
}