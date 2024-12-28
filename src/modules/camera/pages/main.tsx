import { StyleSheet } from "react-native"
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera"
import { RequestCameraPermissionsPage } from "./requestCameraPermissions"

export function CameraView() {
    const device: any = useCameraDevice("back")
    const { hasPermission } = useCameraPermission()

    if (!hasPermission) return <RequestCameraPermissionsPage />
    return <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
}
