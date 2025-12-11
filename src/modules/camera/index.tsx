import ColorTheme, { colors } from "@/constants/colors"
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
import LanguageContext from "@/contexts/Preferences/language"
import sizes from "@/constants/sizes"
import fonts from "@/constants/fonts"
import SettingsHeaderLeft from "@/components/headers/settings/settings-header_left"
import { CameraProvider, useCameraContext } from "./context"

const Stack = createNativeStackNavigator<Routes>()

export function CameraModule(): React.ReactElement | null {
    const cameraPermission = Camera.getCameraPermissionStatus()
    const microphonePermission = Camera.getMicrophonePermissionStatus()
    // Hook to get isRecording from context
    function getCameraHeaderTitle() {
        const { isRecording } = useCameraContext()
        const { t } = React.useContext(LanguageContext)
        return isRecording ? t("Gravando") : t("New Moment")
    }

    console.log(
        `Re-rendering Navigator. Camera: ${cameraPermission} | Microphone: ${microphonePermission}`,
    )

    const showPermissionsPage =
        cameraPermission !== "granted" || microphonePermission === "not-determined"

    const { t } = React.useContext(LanguageContext)
    const HeaderStyle = {
        ...sizes.headers,
        backgroundColor: ColorTheme().background,
    }
    return (
        <CameraProvider>
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
                            headerTitleAlign: "center",
                            headerTitleStyle: { fontFamily: fonts.family["Bold-Italic"] },
                            headerStyle: HeaderStyle,
                            headerTintColor: String(ColorTheme().text),
                            headerLeft: () => <SettingsHeaderLeft />,
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
        </CameraProvider>
    )
}

export default CameraModule

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
})
