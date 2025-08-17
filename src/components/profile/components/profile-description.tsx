import React from "react"
import { Animated, useColorScheme } from "react-native"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { Text } from "../../Themed"
import { useProfileContext } from "../profile-context"
import { ProfileDescriptionProps } from "../profile-types"

export default function description({}: ProfileDescriptionProps) {
    const { user } = useProfileContext()
    const isDarkMode = useColorScheme() === "dark"

    const animatedScale = React.useRef(new Animated.Value(1)).current
    const animatedOpacity = React.useRef(new Animated.Value(0)).current

    function handleAnimation() {
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 30,
            useNativeDriver: true,
            delay: 90,
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    const container: any = {
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings["1md"],
        transform: [{ scale: animatedScale }],
        opacity: animatedOpacity,
    }
    const description_style: any = {
        lineHeight: 18,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        flexDirection: "row",
        textAlign: "center",
    }

    if (!user?.description) {
        return null
    }

    return (
        <Animated.View style={container}>
            <Text style={description_style}>{user?.description}</Text>
        </Animated.View>
    )
}
