import React from "react"
import { Animated, ViewStyle } from "react-native"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import { colors } from "../../../constants/colors"
import { Text } from "../../Themed"
import { useProfileContext } from "../profile-context"
import { textLib } from "@/circle.text.library"
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

    const container: ViewStyle = {
        alignSelf: "center",
        width: sizes.screens.width - sizes.paddings["1xl"] * 2,
        paddingVertical: sizes.paddings["2sm"],
        borderRadius: sizes.paddings["1md"],
        paddingHorizontal: sizes.paddings["1md"],
        transform: [{ scale: animatedScale }],
        opacity: animatedOpacity,
        backgroundColor: colors.gray.grey_08,
        alignItems: "center",
    }

    if (!user?.description) {
        return null
    }

    return (
        <Animated.View style={container}>
            <RichTextRenderer richText={textLib.rich.formatToUI(user.description)} />
        </Animated.View>
    )
}
