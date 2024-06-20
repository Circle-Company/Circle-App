import React from "react"
import { useColorScheme, Animated } from "react-native"
import { colors } from "../../../layout/constants/colors"
import { ProfilePictureProps } from "../profile-types"
import { useProfileContext } from "../profile-context"
import sizes from "../../../layout/constants/sizes"
import { Pressable } from "react-native"
import FastImage from "react-native-fast-image"
import { opacity } from "react-native-reanimated/lib/typescript/reanimated2/Colors"

export default function picture ({
    fromProfile = false
}: ProfilePictureProps) {

    const { user } = useProfileContext()
    const isDarkMode = useColorScheme() === "dark"
    const [profilePicture, setProfilePicture] = React.useState<string>('')

    const pictureDimensions = {
        width: 100,
        height: 100,
        padding: 10,
        borderRadius: 133/2,
    }
    const outlineSize: Number = Number(Number(pictureDimensions.width)/20)// /6

    const container: any = {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: sizes.margins["1sm"],
        borderRadius: + Number([Number(pictureDimensions.width) + Number(outlineSize)]) /2,
        backgroundColor: isDarkMode? colors.gray.grey_06: colors.gray.grey_02,
        width: Number(pictureDimensions.width) + Number(outlineSize),
        height: Number(pictureDimensions.height) + Number(outlineSize),
    }

    async function onProfilePictureAction() {
    }

    var animatedScale = React.useRef(new Animated.Value(0)).current
    var animatedOpacity = React.useRef(new Animated.Value(0.2)).current

    function handleAnimation() {
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 5,
            speed: 80,
            useNativeDriver: true
        }).start()
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 1,
            delay: 50,
            useNativeDriver: true
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    React.useEffect(() => {
        if(fromProfile){
            if(user.profile_picture.small_resolution == undefined){
                setProfilePicture(String(user.profile_picture.tiny_resolution))
            } else setProfilePicture(String(user.profile_picture.small_resolution))
        }
        else {
            if(user.profile_picture.tiny_resolution == undefined){
                setProfilePicture(String(user.profile_picture.small_resolution))
            } else setProfilePicture(String(user.profile_picture.tiny_resolution))       
        }
    }, [])

    const animatedContainer: any = {
        transform: [{ scale: animatedScale }],
        opacity: animatedOpacity
    }

    return (
        <Animated.View style={animatedContainer}>
            <Pressable onPress={onProfilePictureAction} style={[container]}>
                <FastImage
                    source={{ uri: String(profilePicture) || '' }}
                    style={{
                        width: Number(pictureDimensions.width),
                        height: Number(pictureDimensions.height),
                        borderRadius: Number(pictureDimensions.width)/2,
                        position: 'absolute',
                        top: Number(outlineSize)/2,
                        left: Number(outlineSize)/2
                    }}
                />
            </Pressable>            
        </Animated.View>

    )
}