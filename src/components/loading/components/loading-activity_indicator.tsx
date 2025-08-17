import ColorTheme from "@/layout/constants/colors"
import Loading from "@/assets/icons/svgs/circle-spinner.svg"
import { LoadingProps } from "../loading-types"
import { MotiView } from "@motify/components"
import React from "react"

export default function activity_indicator({
    size = 30,
    duration = 1000,
    color = ColorTheme().textDisabled.toString() + "50",
}: LoadingProps) {
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
