import Loading from "@/assets/icons/svgs/circle-spinner.svg"
import { MotiView } from "@motify/components"
import React from "react"
import { ActivityIndicator } from "react-native"
import ColorTheme from "../../../constants/colors"
import { LoadingProps } from "../loading-types"
import { isIOS } from "@/lib/platform/detection"

export default function activity_indicator({
    size = 30,
    duration = 1000,
    color = ColorTheme().textDisabled.toString() + "50",
    progress = 0,
}: LoadingProps) {
    if (isIOS) {
        return (
            <ActivityIndicator
                color={color}
                style={{ width: size, height: size, transform: [{ scale: size / 20 }] }}
            />
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
