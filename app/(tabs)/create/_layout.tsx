import { Stack } from "expo-router"
import React from "react"
import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/Preferences/language"
import HeaderLeft from "@/components/headers/camera/camera-header_left"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { StyleSheet, Platform, View } from "react-native"
import { BlurView } from "expo-blur"
import { CameraProvider } from "@/modules/camera/context"

export default function CameraLayout() {
    const { t } = React.useContext(LanguageContext)

    const HeaderStyle = {
        ...sizes.headers,
        backgroundColor: ColorTheme().background,
    }

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
                        statusBarStyle: "light",
                        animationTypeForReplace: "pop",
                        headerTitleAlign: "center",
                        headerTitleStyle: { fontFamily: fonts.family["Bold-Italic"] },
                        headerStyle: HeaderStyle,
                        headerTransparent: true,
                        headerBackground: () =>
                            Platform.OS === "ios" &&
                            (typeof Platform.Version === "string"
                                ? parseFloat(Platform.Version as any)
                                : (Platform.Version as number)) < 18 ? (
                                <BlurView
                                    intensity={24}
                                    tint="dark"
                                    style={StyleSheet.absoluteFill}
                                />
                            ) : (
                                <View
                                    style={[
                                        StyleSheet.absoluteFill,
                                        { backgroundColor: String(ColorTheme().background) },
                                    ]}
                                />
                            ),
                        headerShadowVisible: false,
                        headerTintColor: String(ColorTheme().text),
                    }}
                >
                    <Stack.Screen
                        name="index"
                        options={{
                            headerTitle: "Camera",
                        }}
                    />
                    <Stack.Screen
                        name="permissions"
                        options={{
                            headerTitle: "Permissions",
                        }}
                    />
                    <Stack.Screen
                        name="media"
                        options={{
                            animation: "none",
                            headerTitle: t("All Ready"),
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
