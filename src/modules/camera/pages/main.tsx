//@ts-nocheck

import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera"

export function CameraView() {
    //@ts-nocheck
    const device = useCameraDevice("back")
    const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission()
    const { hasPermission: hasMicrophonePermission, requestPermission: requestMicrophonePermission } = useMicrophonePermission()

    if (!hasCameraPermission || ! hasMicrophonePermission) {
        requestCameraPermission()
        requestMicrophonePermission()
    }
    return <Camera device={device} isActive={true} />
}
