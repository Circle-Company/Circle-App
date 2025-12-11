import React from "react"
import { Animated } from "react-native"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import { Text } from "../../Themed"
import { useProfileContext } from "../profile-context"
import { RichTextRenderer } from "../../../lib/hooks/useRichTextRenderer"
export default function Description() {
    const { user } = useProfileContext()

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
            <RichTextRenderer text={user?.description} style={description_style} />
        </Animated.View>
    )
}
