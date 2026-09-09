import { Stack } from "expo-router"
import React from "react"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { StyleSheet } from "react-native"
import { CameraProvider } from "../../../modules/camera/context"

export default function CameraLayout() {
    const { t } = React.useContext(LanguageContext)

    return (
        <CameraProvider>
            <GestureHandlerRootView style={styles.root}>
                <Stack
                    screenOptions={{
                        headerShadowVisible: false,
                        animation: "slide_from_right",
                        gestureEnabled: true,
                        fullScreenGestureEnabled: true,
                        headerBackTitle: t("Back"),
                        headerTintColor: "white",
                        headerTitleStyle: {
                            fontFamily: fonts.family["Black-Italic"],
                            fontSize: fonts.size.title2 * 0.9,
                        },
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
