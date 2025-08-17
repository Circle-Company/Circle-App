import { FlexAlignType, StyleSheet } from "react-native"

import { CameraView } from "@/modules/camera/pages/main"
import React from "react"
import { View } from "@/components/Themed"
import sizes from "@/layout/constants/sizes"

export interface Video {
  uri: string;
  duration?: number;
  fileSize?: number;
  type?: string;
}

export default function NewMomentVideoScreen() {

    const styles = StyleSheet.create({
        container: {
            alignItems: "center" as FlexAlignType,
            flex: 1,
            paddingTop: sizes.paddings["1sm"],
        }
    })

    return (
        <View style={styles.container}>
            <CameraView/>
        </View>
    )
}
