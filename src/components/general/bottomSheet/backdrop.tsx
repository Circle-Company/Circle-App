import React from "react"
import sizes from "../../../layout/constants/sizes"
import { Pressable } from "react-native"
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated"
import BottomSheetContext from "../../../contexts/bottomSheet"
export function CustomBackdrop({ style }: any) {
    // animated variables
    const { collapse } = React.useContext(BottomSheetContext)

    // styles
    const containerStyle: any = React.useMemo(
        () => [
            style,
            {
                position: "absolute",
                top: 0,
                left: 0,
                width: sizes.window.width,
                height: sizes.window.height,
                backgroundColor: "#00000090",
            },
        ],
        [style]
    )

    return (
        <Animated.View
            entering={FadeInUp.duration(450)}
            exiting={FadeOut.duration(300)}
            style={containerStyle}
        >
            <Pressable onPress={collapse} style={{ flex: 1 }} />
        </Animated.View>
    )
}
