import React from "react"
import { View, Animated, Pressable } from "react-native"
import { Text } from "../../Themed"
import sizes from "../../../layout/constants/sizes"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import { UserFollowButtonProps } from "../user_show-types"
import { useUserShowContext } from "../user_show-context"
import { UserShowActions } from "../user_show-actions"

export default function follow_button ({
    isFollowing = false,
    hideOnFollowing = true,
    displayOnMoment = false
}: UserFollowButtonProps) {
    
    const { user , follow, unfollow} = useUserShowContext()

    const [followPressed, setFollowPressed] = React.useState(isFollowing)

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
        backgroundColor:displayOnMoment? colors.gray.white : ColorTheme().backgroundDisabled,
        margin: sizes.margins["1sm"],
        alignItems: 'center',
        justifyContent: 'center'
    }
    const username_pressed: any = {
        fontSize: fonts.size.body*0.9,
        fontFamily: fonts.family.Bold,
        color: displayOnMoment? colors.gray.black : ColorTheme().text
    }
    const username_unpressed: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white
    }
    async function ButtonAction() {
        if(followPressed){
            HandleButtonAnimation()
            setFollowPressed(false)
            UserShowActions.UnfollowPressed({user_id: Number(user.id), action: unfollow})
        }else {
            HandleButtonAnimation()
            setFollowPressed(true)
            UserShowActions.FollowPressed({user_id: Number(user.id), action: follow})
        }
    }
    

    if(isFollowing && hideOnFollowing) return null
    if(isFollowing && hideOnFollowing == false){
        if(followPressed) {
            return (
                <Animated.View style={{transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_pressed} onPress={() => ButtonAction()}>
                        <Text style={username_pressed}>Following</Text>
                    </Pressable>                
                </Animated.View>
            )           
        }else {
            return (
                <Animated.View style={{transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_unpressed} onPress={() => ButtonAction()}>
                        <Text style={username_unpressed}>Follow</Text>
                    </Pressable>                
                </Animated.View>
            )
        }
    }
    else {

        if(followPressed) {
            return (
                <Animated.View style={{transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_pressed} onPress={() => ButtonAction()}>
                        <Text style={username_pressed}>Following</Text>
                    </Pressable>                
                </Animated.View>
            )           
        }else {
            return (
                <Animated.View style={{transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_unpressed} onPress={() => ButtonAction()}>
                        <Text style={username_unpressed}>Follow</Text>
                    </Pressable>                
                </Animated.View>
            )
        }
    }
}