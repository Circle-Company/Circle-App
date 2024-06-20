import { View, Animated} from "react-native";
import sizes from "../../../../layout/constants/sizes";
import { ProfileStatisticsContainerProps } from "../../profile-types";
import React from "react";

export default function statistics_container ({
    children
}: ProfileStatisticsContainerProps) {
    var animatedOpacity = React.useRef(new Animated.Value(0.2)).current

    function handleAnimation() {
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 0.5,
            useNativeDriver: true,
            delay: 80
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    const container: any = {
        width: sizes.screens.width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: sizes.paddings["1xl"]*1.2,
        opacity: animatedOpacity
    }

    return (
        <Animated.View style={container}>
            {children}
        </Animated.View>
    )
} 