import React from "react"
import { Animated, ViewStyle } from "react-native"
import sizes from "../../../../layout/constants/sizes"
import { ProfileStatisticsContainerProps } from "../../profile-types"

export default function statistics_container({ children }: ProfileStatisticsContainerProps) {
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
        width: sizes.screens.width,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between", // Distribui os itens uniformemente
        paddingHorizontal: sizes.paddings["1xl"] * 1.2,
        opacity: animatedOpacity,
        gap: 10, // Adiciona espaçamento entre os itens (React Native 0.70+)
    }

    return <Animated.View style={container}>{children}</Animated.View>
}
