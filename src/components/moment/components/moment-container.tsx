import React from "react"
import { View, Pressable, Text} from "react-native"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { MidiaRender } from "../../midia_render"
import { useNavigation } from "@react-navigation/native"
import MomentContext from "../context"
import FeedContext from "../../../contexts/Feed"
import { UserShow } from "../../user_show"
import { MomentContainerProps } from "../moment-types"
import Reanimated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated"
import { Animated } from "react-native"
import LikeIcon from '../../../assets/icons/svgs/heart.svg'
import { opacity } from "react-native-reanimated/lib/typescript/reanimated2/Colors"
import DoubleTapPressable from "../../general/double-tap-pressable"
export default function Container({
    children,
    contentRender,
    blur_color = String(ColorTheme().background),
    blurRadius = 35,
    isFocused = true,
    fromFullMomentScreen = false

}: MomentContainerProps) {
    const { momentData, momentUserActions, momentSize, momentOptions } = React.useContext(MomentContext)
    const { commentEnabled, setFocusedMoment, setFocusedItemId} = React.useContext(FeedContext)
    const [isOnAnimation, setIsOnAnimation] = React.useState(false)
    var animatedScaleIcon = React.useRef(new Animated.Value(1)).current
    var animatedOpacityIcon = React.useRef(new Animated.Value(1)).current

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

    const icon_container: any = {
        transform: [{ scale: animatedScaleIcon }],
        opacity: animatedOpacityIcon,
        alignItems: 'center',
        justifyContent: 'center',
    }

    async function handleDoublePress() {
        momentUserActions.handleLikeButtonPressed({})         
    }

    async function handleSinglePress() {
        if(!commentEnabled && momentOptions.isFeed) {
            if(!fromFullMomentScreen && isFocused) {
                setFocusedMoment(momentData)
                setFocusedItemId(Number(momentData.id))
            }
            navigation.navigate('MomentNavigator', { screen: 'DetailScreen' })
        }

    }

    return (
        <View style={container}>
            <View style={content_container}>
            <DoubleTapPressable
                onSingleTap={handleSinglePress}
                onDoubleTap={handleDoublePress}
            >
                <MidiaRender.Root data={contentRender} content_sizes={momentSize}>
                <MidiaRender.RenderImage isFeed={momentOptions.isFeed} enableBlur={true} blur={!isFocused}/>
                </MidiaRender.Root>  
            </DoubleTapPressable>         
            </View>
            {!commentEnabled? 
                    isFocused? children : null               
                    :
                        <Reanimated.View style={tiny_container} entering={FadeIn.delay(300).duration(200)} exiting={FadeOut.duration(100)}>
                            <UserShow.Root data={momentData.user}>
                                <View style={{top: 1}}>
                                    <UserShow.ProfilePicture
                                    disableAnalytics={true}
                                    pictureDimensions={{width: 15, height: 15}}
                                    />  
                                </View>
                                <UserShow.Username scale={0.8} disableAnalytics={true} margin={0} truncatedSize={8}/>
                            </UserShow.Root>
                        </Reanimated.View>
                    }
        </View>

    )
}
