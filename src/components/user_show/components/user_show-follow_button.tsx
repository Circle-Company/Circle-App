import React from "react"
import { View, Animated, Pressable } from "react-native"
import { Text } from "../../Themed"
import sizes from "../../../layout/constants/sizes"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import { UserFollowButtonProps } from "../user_show-types"
import { useUserShowContext } from "../user_show-context"

export default function follow_button ({
    isFollowing = false
}: UserFollowButtonProps) {
    
    const { user } = useUserShowContext()

    const [followPressed, setFollowPressed] = React.useState(false)

    var animatedScale = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => { animatedScale.setValue(1) }, [])
    const HandleButtonAnimation = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true
        }).start()
    }

    const container_unpressed: any = {
        width: sizes.buttons.width/4,
        height: sizes.buttons.height/2,
        borderRadius: Number([sizes.buttons.width/4])/2,
        backgroundColor: ColorTheme().primary,
        margin: sizes.margins["1sm"],
        alignItems: 'center',
        justifyContent: 'center'
    }
    const container_pressed: any = {
        width: sizes.buttons.width/4,
        height: sizes.buttons.height/2,
        borderRadius: Number([sizes.buttons.width/4])/2,
        backgroundColor: colors.gray.white,
        margin: sizes.margins["1sm"],
        alignItems: 'center',
        justifyContent: 'center'
    }
    const username_pressed: any = {
        fontSize: fonts.size.body*0.9,
        fontFamily: fonts.family.Bold,
        color: colors.gray.black
    }
    const username_unpressed: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white
    }
    
    

    async function onFollowAction() {
        HandleButtonAnimation()
        setFollowPressed(true)
        console.log('FollowPressed')
    }
    async function onUnfollowAction() {
        HandleButtonAnimation()
        setFollowPressed(false)
        console.log('unfollowPressed')
    }

    if(isFollowing) return null
    else {

        if(followPressed) {
            return (
                <Animated.View style={{transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_pressed} onPress={() => onUnfollowAction()}>
                        <Text style={username_pressed}>Following</Text>
                    </Pressable>                
                </Animated.View>
            )           
        }else {
            return (
                <Animated.View style={{transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_unpressed} onPress={() => onFollowAction()}>
                        <Text style={username_unpressed}>Follow</Text>
                    </Pressable>                
                </Animated.View>
            )
        }
    }
}