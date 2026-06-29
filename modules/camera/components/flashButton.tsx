import React from "react"
import { StyleSheet } from "react-native"
import { PressableOpacity } from "react-native-pressable-opacity"

import { useCameraContext } from "../context"
import { colors } from "@/constants/colors"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { Button, Host, Image } from "@expo/ui/swift-ui"
import { frame, glassEffect } from "@expo/ui/swift-ui/modifiers"
import { SymbolView } from "expo-symbols"
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
                        systemName={torch === "on" ? "flashlight.on.fill" : "flashlight.off.fill"}
                        color={iconFill}
                        size={24}
                    />
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
                <SymbolView
                    name={torch === "on" ? "flashlight.on.fill" : "flashlight.off.fill"}
                    tintColor={colors.gray.white + 80}
                    size={22}
                />
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
