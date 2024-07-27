import { useCameraPermission } from "react-native-vision-camera"

const { hasPermission, requestPermission } = useCameraPermission()

export function requestCameraModulePermissions() {
    if (hasPermission) return
    else requestPermission()
}
