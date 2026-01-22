import React from "react"
import { StyleSheet } from "react-native"
import { PressableOpacity } from "react-native-pressable-opacity"

import { useCameraContext } from "../context"
import FlashOnIcon from "@/assets/icons/svgs/flashlight.on.fill.svg"
import FlashOffIcon from "@/assets/icons/svgs/flashlight.off.fill.svg"
import { colors } from "@/constants/colors"
import { iOSMajorVersion } from "@/lib/platform/detection"
import sizes from "@/constants/sizes"
import { Button, Host } from "@expo/ui/swift-ui"
import { View } from "react-native"

export function FlashButton() {
    const { torch, setTorch, cameraPosition } = useCameraContext()

    const isFront = cameraPosition === "front"
    const disabled = isFront
    const iconFill = isFront ? "#888888" : "#ffffff"

    const toggleTorch = () => {
        if (!disabled) {
            setTorch(torch === "off" ? "on" : "off")
        }
    }

    if (isFront) return <View style={{ width: styles.sideButton.width }} />

    if (iOSMajorVersion! >= 26) {
        return (
            <Host matchContents>
                <Button
                    key={torch == "on" ? "lightOn" : "lightOff"}
                    onPress={toggleTorch}
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
                    controlSize="large"
                >
                    {torch === "on" ? (
                        <FlashOnIcon fill={iconFill} width={10} height={10} />
                    ) : (
                        <FlashOffIcon fill={iconFill + 40} width={10} height={10} />
                    )}
                </Button>
            </Host>
        )
    } else {
        return (
            <PressableOpacity
                style={[
                    styles.sideButton,
                    torch === "on" && styles.sideButtonTorchOn,
                    disabled && { opacity: 0.4 },
                ]}
                onPress={toggleTorch}
                disabled={disabled}
                disabledOpacity={0.4}
            >
                {torch === "on" ? (
                    <FlashOnIcon fill={colors.gray.white + 80} width={22} height={22} />
                ) : (
                    <FlashOnIcon fill={colors.gray.white + 80} width={22} height={22} />
                )}
            </PressableOpacity>
        )
    }
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
    sideButtonTorchOn: {
        // Keep visual consistency with camera page styling
        backgroundColor: colors.yellow.yellow_09 + 90,
    },
})
