import Animated, { FadeInUp } from "react-native-reanimated"

import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet"
import React from "react"
import { Pressable } from "react-native"
import sizes from "../../../constants/sizes"
import BottomSheetContext from "../../../contexts/bottomSheet"

// Adiciona as novas props
interface CustomBackdropProps extends BottomSheetBackdropProps {
    visible?: boolean
}

export function CustomBackdrop({ style, visible = true }: CustomBackdropProps) {
    // animated variables
    const { collapse } = React.useContext(BottomSheetContext)
    const [localVisible, setLocalVisible] = React.useState(visible)

    React.useEffect(() => {
        setLocalVisible(visible)
    }, [visible])

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
        [style],
    )

    if (!localVisible) return null

    function handlePress() {
        setLocalVisible(false)
        collapse()
    }

    return (
        <Animated.View entering={FadeInUp.duration(450)} style={containerStyle}>
            <Pressable onPress={handlePress} style={{ flex: 1 }} />
        </Animated.View>
    )
}
