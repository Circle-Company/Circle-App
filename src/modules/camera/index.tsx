import { colors } from "@/constants/colors"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Camera } from "react-native-vision-camera"
import { CameraPage } from "./pages/camera"
import { DevicesPage } from "./pages/devices"
import { MediaPage } from "./pages/media"
import { PermissionsPage } from "./pages/permissions"
import type { Routes } from "./routes"

const Stack = createNativeStackNavigator<Routes>()

export function CameraModule(): React.ReactElement | null {
    const cameraPermission = Camera.getCameraPermissionStatus()
    const microphonePermission = Camera.getMicrophonePermissionStatus()

    console.log(
        `Re-rendering Navigator. Camera: ${cameraPermission} | Microphone: ${microphonePermission}`,
    )

    const showPermissionsPage =
        cameraPermission !== "granted" || microphonePermission === "not-determined"
    return (
        <GestureHandlerRootView style={styles.root}>
            <Stack.Navigator
                screenOptions={{
                    statusBarStyle: "dark",
                    animationTypeForReplace: "push",
                }}
                initialRouteName={"CameraPage"}
            >
                <Stack.Screen
                    options={{ headerShown: false }}
                    name="PermissionsPage"
                    component={PermissionsPage}
                />
                <Stack.Screen
                    name="CameraPage"
                    component={CameraPage}
                    options={{
                        statusBarHidden: true,
                        headerBackTitle: "Back",
                        headerStyle: {
                            backgroundColor: colors.gray.black,
                        },
                    }}
                />
                <Stack.Screen
                    name="MediaPage"
                    component={MediaPage}
                    options={{
                        animation: "none",
                        headerShown: false,
                        presentation: "transparentModal",
                    }}
                />
                <Stack.Screen
                    name="Devices"
                    component={DevicesPage}
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
        </GestureHandlerRootView>
    )
}

export default CameraModule

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
})
