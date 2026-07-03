import React from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import type { SharedValue } from "react-native-reanimated"
import type { CameraVideoOutput } from "react-native-vision-camera"

import { CaptureButton } from "./CaptureButton"
import { FlashButton } from "./flashButton"
import { RotateButton } from "./rotateButton"

interface Props {
    style?: ViewStyle
    videoOutput: CameraVideoOutput
    cameraZoom: SharedValue<number>
    minZoom: number
    maxZoom: number
    enabled: boolean
    setIsPressingButton: (v: boolean) => void
    onRecordingStart: () => void
    onRecordingStop: () => void
    onFlipCamera: () => void
    onMediaCaptured: (filePath: string, duration: number) => void
}

export const CameraBottomBar: React.FC<Props> = ({
    style,
    videoOutput,
    cameraZoom,
    minZoom,
    maxZoom,
    enabled,
    setIsPressingButton,
    onRecordingStart,
    onRecordingStop,
    onFlipCamera,
    onMediaCaptured,
}) => (
    <View style={[styles.bar, style]}>
        <RotateButton />
        <CaptureButton
            style={styles.captureButton}
            videoOutput={videoOutput}
            cameraZoom={cameraZoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
            enabled={enabled}
            setIsPressingButton={setIsPressingButton}
            onRecordingStart={onRecordingStart}
            onRecordingStop={onRecordingStop}
            onFlipCamera={onFlipCamera}
            onMediaCaptured={onMediaCaptured}
        />
        <FlashButton />
    </View>
)

const styles = StyleSheet.create({
    bar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 10,
    },
    captureButton: {
        width: 80,
        height: 80,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 24,
    },
})
