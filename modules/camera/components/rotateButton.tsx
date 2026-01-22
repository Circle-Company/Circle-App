import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { PressableOpacity } from "react-native-pressable-opacity"
import { Button, Host } from "@expo/ui/swift-ui"
import Reanimated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { useCameraContext } from "../context"
import RotateIcon from "@/assets/icons/svgs/arrow.triangle.2.circlepath.svg"
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
                    variant="glass"
                    modifiers={[
                        {
                            $type: "frame",
                            width: styles.sideButton.width,
                            height: styles.sideButton.height,
                        },
                        {
                            $type: "background",
                            material: "systemThinMaterialDark",
                            shape: "circle",
                        },
                    ]}
                >
                    <RotateIcon fill={colors.gray.white} width={10} height={10} />
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
                <RotateIcon fill={colors.gray.white} width={22} height={22} />
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
