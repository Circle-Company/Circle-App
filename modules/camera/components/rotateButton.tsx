import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { PressableOpacity } from "react-native-pressable-opacity"
import { Button, Host, Image } from "@expo/ui/swift-ui"
import { frame, glassEffect } from "@expo/ui/swift-ui/modifiers"
import { SymbolView } from "expo-symbols"
import Reanimated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { useCameraContext } from "../context"
import { colors } from "@/constants/colors"
import { iOSMajorVersion } from "@/lib/platform/detection"

export function RotateButton() {
    const { cameraPosition, setCameraPosition } = useCameraContext()
    const rotateAnimation = useSharedValue(0)

    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === "back" ? "front" : "back"))
    }, [setCameraPosition])

    const rotateIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotateAnimation.value}deg` }],
        }
    }, [rotateAnimation])

    // iOS 26 render path (keep Host/Button)
    if (iOSMajorVersion! >= 26) {
        return (
            <Host matchContents>
                <Button
                    key={cameraPosition}
                    onPress={onFlipCameraPressed}
                    modifiers={[
                        frame({
                            width: styles.sideButton.width,
                            height: styles.sideButton.height,
                        }),
                        glassEffect({
                            glass: { variant: "regular", interactive: true },
                            shape: "circle",
                        }),
                    ]}
                >
                    <Image
                        systemName="arrow.triangle.2.circlepath"
                        color={colors.gray.white}
                        size={24}
                    />
                </Button>
            </Host>
        )
    }

    // Fallback render
    return (
        <PressableOpacity
            style={styles.sideButton}
            onPress={onFlipCameraPressed}
            disabledOpacity={0.4}
        >
            <Reanimated.View style={rotateIconStyle}>
                <SymbolView
                    name="arrow.triangle.2.circlepath"
                    tintColor={colors.gray.white}
                    size={22}
                />
            </Reanimated.View>
        </PressableOpacity>
    )
}

const styles = StyleSheet.create({
    sideButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(140, 140, 140, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 8,
    },
})
