import React from "react"
import { View, Pressable,} from "react-native"
import ColorTheme from "../../../layout/constants/colors"
import { MidiaRender } from "../../midia_render"
import { useNavigation } from "@react-navigation/native"
import MomentContext from "../context"
import FeedContext from "../../../contexts/Feed"
import { UserShow } from "../../user_show"
import { MomentContainerProps } from "../moment-types"
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated"

export default function Container({
    children,
    contentRender,
    blur_color = String(ColorTheme().background),
    blurRadius = 35,
    isFocused = true

}: MomentContainerProps) {
    const { momentData, momentFunctions, momentSize, momentOptions } = React.useContext(MomentContext)
    const { commentEnabled } = React.useContext(FeedContext)

    const navigation = useNavigation()
    
    const container: any = {
        ...momentSize,
        overflow: 'hidden',
        backgroundColor: ColorTheme().backgroundDisabled,
    }
    const content_container: any = {
        flex: 1,
        position: 'absolute',
        width: momentSize.width,
        height: momentSize.height,
        zIndex: 0

    }

    const tiny_container: any = {
        width: momentSize.width * 0.31,
        height: momentSize.height * 0.31,
        position: 'absolute',
        alignItems: 'flex-start',
        flexDirection: 'row',
        top: 190,
        left: 120,
        flex: 1,
        zIndex: 1,
        transform: [{scale: 3}]
    }

    async function handlePress() {
        if(!commentEnabled && momentOptions.isFeed) navigation.navigate('MomentNavigator', { screen: 'DetailScreen' })
    }

    return (
        <View style={container}>
            <View style={content_container}>
                <Pressable onPress={handlePress}>
                        <MidiaRender.Root data={contentRender} content_sizes={momentSize}>
                        <MidiaRender.RenderImage enableBlur={true} blur={!isFocused}/>
                        </MidiaRender.Root>                  
                </Pressable>                
            </View>
            {!commentEnabled? 
                            momentOptions.isFocused? children : null               
                    :
                        <View style={tiny_container}>
                            <UserShow.Root data={momentData.user}>
                                <View style={{top: 1}}>
                                    <UserShow.ProfilePicture
                                    disableAnalytics={true}
                                    pictureDimensions={{width: 15, height: 15}}
                                    />  
                                </View>
                                <UserShow.Username scale={0.8} disableAnalytics={true} margin={0} truncatedSize={8}/>
                            </UserShow.Root>
                        </View>
                    }
        </View>

    )
}
