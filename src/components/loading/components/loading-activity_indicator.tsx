import Loading from "@/assets/icons/svgs/circle-spinner.svg"
import { MotiView } from "@motify/components"
import React from "react"
import ColorTheme from "../../../constants/colors"
import { LoadingProps } from "../loading-types"
import { isIOS } from "@/lib/platform/detection"
import { CircularProgress, Host } from "@expo/ui/swift-ui"

export default function activity_indicator({
    size = 30,
    duration = 1000,
    color = ColorTheme().textDisabled.toString() + "50",
    progress = 0,
}: LoadingProps) {
    if (isIOS) {
        return (
            <Host style={{ width: size, height: size }}>
                <CircularProgress progress={progress} color={color} />
            </Host>
        )
    }
    return (
        <MotiView
            from={{
                rotate: "0deg",
            }}
            animate={{
                rotate: "360deg", // Rotação completa em 360 graus
            }}
            transition={{
                type: "timing",
                duration,
                repeatReverse: false,
                loop: true,
            }}
            style={{
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Loading width={size} height={size} fill={color} />
        </MotiView>
    )
}
