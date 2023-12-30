import React from "react"
import { View, Pressable, Animated } from "react-native"
import { Text } from "../../Themed"

import NumberConversor from "../../../algorithms/numberConversor"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, {colors} from "../../../layout/constants/colors"
import { BlurView } from "@react-native-community/blur"
import LikeIcon from '../../../assets/icons/svgs/heart.svg'
import { MomentLikeProps } from "../moment-types"
import { useMomentContext } from "../moment-context"

export default function like ({ isLiked }: MomentLikeProps) {
    const {moment} = useMomentContext()
    
    var animatedScale = React.useRef(new Animated.Value(1)).current
    var animatedScaleIconPressed = React.useRef(new Animated.Value(1)).current
    var animatedScaleIcon = React.useRef(new Animated.Value(1)).current

    React.useEffect(() => { animatedScale.setValue(1) }, [])
    const HandleButtonAnimation = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true
        }).start()

        animatedScaleIconPressed.setValue(0.4)
        animatedScaleIcon.setValue(0.4)
        Animated.spring(animatedScaleIconPressed, {
            toValue: 1,
            bounciness: 12,
            speed: 8,
            useNativeDriver: true
        }).start()

        animatedScaleIcon.setValue(1.4)
        Animated.spring(animatedScaleIcon, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true
        }).start()
    }

    const container: any = {
        minWidth: sizes.buttons.width/4,
        height: sizes.buttons.height/2,
        borderRadius: Number([sizes.buttons.width/4])/2,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: sizes.paddings["2sm"],
        backgroundColor: 'transparent',
        overflow: 'hidden'
    }
    
    const like_text_pressed: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white,
        marginLeft: sizes.margins["1sm"],
    }
    const like_text: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white,
        marginLeft: sizes.margins["1sm"],
    }
    const blur_container: any = {
        backgroundColor: ColorTheme().blur_button_color
    }
    const blur_container_likePressed: any = {
        backgroundColor: ColorTheme().like
    }
    const pressable_container: any = {
        overflow: "hidden",
        borderRadius:  Number([sizes.buttons.width/4])/2,
    }
    const animated_container: any = {
        width: sizes.buttons.width/4,
        height: sizes.buttons.height/2,
        margin: sizes.margins["1sm"],
        transform: [{ scale: animatedScale }] 
    }
    const icon_container: any = {
        transform: [{ scale: animatedScaleIcon }],
        paddingRight: 4
    }
    const icon_container_pressed: any = {
        transform: [{ scale: animatedScaleIconPressed }],
        paddingRight: 4
    }

    const [likedPressed, setLikedPressed] = React.useState(isLiked)

    async function onLikeAction() {
        HandleButtonAnimation()
        console.log('LikePressed')
        setLikedPressed(true)
    }
    async function onDislikeAction() {
        HandleButtonAnimation()
        console.log('disLikePressed')
        setLikedPressed(false)
    }

    const like_fill = String(colors.gray.white)
    const like_number = NumberConversor(Number(moment.likes_count))
    
    if(likedPressed) {
        return (
            <Animated.View style={animated_container}>
                <Pressable  onPress={() => onDislikeAction()} style={pressable_container}>
                    <View style={blur_container_likePressed}>
                        <View style={container}>
                            <Animated.View style={icon_container_pressed}>
                                <LikeIcon fill={like_fill} width={20} height={20}/>
                            </Animated.View>
                            <Text style={likedPressed?like_text_pressed: like_text}>{like_number}</Text>                                              
                        </View>                        
                    </View>
                </Pressable>
            </Animated.View>
        )   
    }
    else{
        return (
            <Animated.View style={animated_container}>
                <Pressable  onPress={() => onLikeAction()} style={pressable_container}>
                    <BlurView
                        overlayColor={String(colors.transparent.black_00)}
                        blurAmount={sizes.blur.blurAmount}
                        style={blur_container}
                    >
                        <View style={container}>
                            <Animated.View style={icon_container}>
                                <LikeIcon fill={like_fill} width={14} height={14}/>
                            </Animated.View>
                            <Text style={likedPressed?like_text_pressed: like_text}>{like_number}</Text>                                       
                        </View>                        
                    </BlurView>
                </Pressable>
            </Animated.View>
        )        
    }
}