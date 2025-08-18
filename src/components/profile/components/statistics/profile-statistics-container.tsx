import React from "react"
import { Animated, ViewStyle } from "react-native"
import ColorTheme from "../../../../constants/colors"
import sizes from "../../../../constants/sizes"
import { ProfileStatisticsContainerProps } from "../../profile-types"

export default function StatisticsContainer({ children }: ProfileStatisticsContainerProps) {
    const animatedOpacity = React.useRef(new Animated.Value(0.2)).current

    function handleAnimation() {
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 0.5,
            useNativeDriver: true,
            delay: 80,
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    const container: ViewStyle = {
        gap: -sizes.margins["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1md"],
        marginBottom: sizes.margins["1md"],
        backgroundColor: ColorTheme().backgroundDisabled + 90,
        borderRadius: 100,
        paddingVertical: sizes.paddings["1sm"] * 0.7,
        marginHorizontal: sizes.paddings["1lg"],
        width: sizes.screens.width / 1.4,
        flexDirection: "row",
    }

    return <Animated.View style={container}>{children}</Animated.View>
}
