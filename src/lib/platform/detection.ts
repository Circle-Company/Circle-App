import * as Device from "expo-device"
import { Dimensions } from "react-native"
import { Platform } from "react-native"

export const isIOS = Platform.OS === "ios"
export const isAndroid = Platform.OS === "android"
export const isNative = isIOS || isAndroid
export const devicePlatform = isIOS ? "ios" : isAndroid ? "android" : "web"
export const isWeb = !isNative
export const iOSMajorVersion =
    Platform.OS === "ios" ? parseInt(String(Platform.Version).split(".")[0], 10) : undefined

export const isIPad11 =
    Platform.OS === "ios" &&
    Device.deviceName?.includes("11") &&
    Device.deviceName?.includes("iPad")
export const isIPad13 =
    Platform.OS === "ios" &&
    Device.deviceName?.includes("13") &&
    Device.deviceName?.includes("iPad")

export const isIPad = isIPad11 || isIPad13
export function getIPadVersion(): "11" | "13" | undefined {
    if (isIPad11) return "11"
    if (isIPad13) return "13"
    return undefined
}
