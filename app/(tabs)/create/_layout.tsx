import { Stack } from "expo-router"
import React from "react"
import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { StyleSheet, Platform, View } from "react-native"
import { BlurView } from "expo-blur"
import { CameraProvider } from "../../../modules/camera/context"

export default function CameraLayout() {
    const { t } = React.useContext(LanguageContext)

    return (
        <CameraProvider>
            <GestureHandlerRootView style={styles.root}>
                {Platform.OS === "ios" &&
                (typeof Platform.Version === "string"
                    ? parseFloat(Platform.Version as any)
                    : (Platform.Version as number)) < 18 ? (
                    <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
                ) : (
                    <View
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: String(ColorTheme().background) },
                        ]}
                    />
                )}
                <Stack
                    screenOptions={{
                        headerShadowVisible: false,
                        animation: "slide_from_right",
                        gestureEnabled: true,
                        fullScreenGestureEnabled: true,
                        headerBackTitle: t("Back"),
                        headerTintColor: "white",
                        headerTitleStyle: { fontFamily: fonts.family["Black-Italic"] },
                        headerStyle: {
                            backgroundColor: "black",
                        },
                    }}
                >
                    <Stack.Screen
                        name="index"
                        options={{
                            headerTitle: "Camera",
                        }}
                    />
                    <Stack.Screen
                        name="media"
                        options={{
                            statusBarAnimation: "fade",
                            headerTransparent: false,
                            headerShadowVisible: false,
                            headerTintColor: "white",
                            headerTitleStyle: { fontFamily: fonts.family["Black-Italic"] },
                            headerStyle: {
                                backgroundColor: "black",
                            },
                            headerTitle: t("All Ready"),
                            headerBackTitle: t("Back"),
                        }}
                    />
                </Stack>
            </GestureHandlerRootView>
        </CameraProvider>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
})
