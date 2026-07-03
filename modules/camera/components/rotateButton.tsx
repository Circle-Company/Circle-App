import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { PressableOpacity } from "react-native-pressable-opacity"
import { Button, Host, Image } from "@expo/ui/swift-ui"
import { frame, glassEffect } from "@expo/ui/swift-ui/modifiers"
import { SymbolView } from "expo-symbols"
import Reanimated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { useCameraContext } from "../context"
import { colors } from "@/constants/colors"
import { iOSMajorVersion } from "@/lib/platform/detection"

// Quick squeeze-and-bounce pulse the glass container plays the moment the
// button fires, so the user sees clearly that their tap registered (the
// rotation/flip happens off-screen on the live preview, so without this
// feedback the button itself feels inert).
const PRESS_SCALE = 0.86
const SPRING_BACK = { damping: 7, stiffness: 240, mass: 0.6 } as const

export function RotateButton() {
    const { cameraPosition, setCameraPosition } = useCameraContext()
    const containerScale = useSharedValue(1)

    const triggerPulse = useCallback(() => {
        containerScale.value = withSequence(
            withTiming(PRESS_SCALE, { duration: 90 }),
            withSpring(1, SPRING_BACK),
        )
    }, [containerScale])

    const onFlipCameraPressed = useCallback(() => {
        triggerPulse()
        setCameraPosition((p) => (p === "back" ? "front" : "back"))
    }, [setCameraPosition, triggerPulse])

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: containerScale.value }],
    }))

    // iOS 26 render path (keep Host/Button — wrap in Reanimated.View so we
    // can scale the whole glass capsule; Host's native UIView honors RN
    // transforms even though its content is SwiftUI).
    if (iOSMajorVersion! >= 26) {
        return (
            <Reanimated.View style={containerStyle}>
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
            </Reanimated.View>
        )
    }

    // Fallback render
    return (
        <Reanimated.View style={containerStyle}>
            <PressableOpacity
                style={styles.sideButton}
                onPress={onFlipCameraPressed}
                disabledOpacity={0.4}
            >
                <SymbolView
                    name="arrow.triangle.2.circlepath"
                    tintColor={colors.gray.white}
                    size={22}
                />
            </PressableOpacity>
        </Reanimated.View>
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
