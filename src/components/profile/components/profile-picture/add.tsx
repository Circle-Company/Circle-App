import React from "react"
import { Pressable, View } from "react-native"
import Svg, { Circle } from "react-native-svg"
import { SymbolView } from "expo-symbols"
import Camera from "@/assets/icons/svgs/camera.svg"
import { colors } from "@/constants/colors"

type ProfilePictureAddProps = {
    size?: number
    onPress?: () => void
}

export function ProfilePictureAdd({ size = 200, onPress }: ProfilePictureAddProps) {
    const strokeWidth = 3
    const radius = (size - strokeWidth) / 2

    return (
        <Pressable
            onPress={onPress}
            hitSlop={12}
            style={({ pressed }) => ({
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Add profile picture"
        >
            <Svg width={size} height={size} style={{ position: "absolute" }}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.purple.purple_03}
                    strokeWidth={strokeWidth}
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    fill="none"
                />
            </Svg>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
                <SymbolView
                    name="camera.fill"
                    tintColor={colors.purple.purple_03}
                    size={size * 0.32}
                    fallback={
                        <Camera
                            width={size * 0.32}
                            height={size * 0.32}
                            fill={colors.purple.purple_03}
                        />
                    }
                />
            </View>
        </Pressable>
    )
}
