import React from "react"
import { FlexAlignType, StyleSheet } from "react-native"
import { View } from "@/components/Themed"
import sizes from "@/constants/sizes"
import { CameraPage } from "@/modules/camera/pages/camera"

export interface Video {
    uri: string
    duration?: number
    fileSize?: number
    type?: string
}

export default function CameraScreen() {
    const styles = StyleSheet.create({
        container: {
            alignItems: "center" as FlexAlignType,
            flex: 1,
            paddingTop: sizes.paddings["1sm"],
        },
    })

    return (
        <View style={styles.container}>
            <CameraPage />
        </View>
    )
}
