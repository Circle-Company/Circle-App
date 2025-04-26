import { useFocusEffect } from "@react-navigation/native"
import React, { Component, useCallback, useEffect, useRef, useState } from "react"
import {
    Dimensions,
    Modal,
    NativeMethods,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
    requireNativeComponent,
} from "react-native"

import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"

import sizes from "@/layout/constants/sizes"
import CaptureButton from "../components/ui/buttons/capture"
import FlashButton from "../components/ui/buttons/flash"
import RotateButton from "../components/ui/buttons/rotate"
import ErrorScreen from "../components/ui/ErrorScreen"
import { useCamera } from "../core/CameraContext"
import useCameraFunctions from "../hooks/useCameraFunctions"
import useCameraGestures from "../hooks/useCameraGestures"
import { RCTCameraViewProps } from "../types/camera.types"

const screenWidth = Dimensions.get("window").width
const RCTCameraView = requireNativeComponent<RCTCameraViewProps>("CircleCameraView")

const CameraScreen: React.FC = () => {
    const camera = useCamera()
    const viewRef = useRef<Component<RCTCameraViewProps> & Readonly<NativeMethods>>(null)
    const [errorModalVisible, setErrorModalVisible] = useState(false)

    const {
        error: cameraError,
        flashMode,
        setError,
        initialize,
        handleCameraError,
        handleToggleFlash,
        handleSwitchCamera,
        handleTakePhoto,
    } = useCameraFunctions({ viewRef })

    const { zoomLevel, composedGesture, setViewDimensions } = useCameraGestures({ viewRef })

    useEffect(() => {
        initialize().catch(console.error)
        return () => {
            if (camera && typeof camera.stopCamera === "function") {
                camera.stopCamera().catch(console.error)
            }
        }
    }, [initialize, camera])

    useEffect(() => {
        setErrorModalVisible(!!cameraError)
    }, [cameraError])

    const handleCloseErrorModal = useCallback(() => {
        setErrorModalVisible(false)
        setError(null)
    }, [setError])

    useFocusEffect(
        useCallback(() => {
            setError(null)
        }, [setError, camera])
    )

    const renderControls = () => (
        <View style={styles.controlsContainer}>
            <View style={styles.captureButtonsContainer}>
                <RotateButton
                    onPress={handleSwitchCamera}
                    size={24}
                    color="#FFFFFF"
                    style={styles.controlButton}
                />
                <CaptureButton onPress={handleTakePhoto} />
                <FlashButton
                    mode={flashMode}
                    onPress={handleToggleFlash}
                    size={24}
                    color="#FFFFFF"
                    style={styles.controlButton}
                />
            </View>
        </View>
    )

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: withTiming(screenWidth * sizes.momentAspectRatio, {
                duration: 300,
            }),
        }
    })

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

                <GestureDetector gesture={composedGesture}>
                    <Animated.View
                        style={[styles.cameraContainer, animatedStyle]}
                        onLayout={(event) => {
                            setViewDimensions(event.nativeEvent.layout)
                        }}
                    >
                        <RCTCameraView
                            ref={viewRef}
                            style={styles.camera}
                            flashMode={flashMode}
                            zoom={zoomLevel}
                            onError={handleCameraError}
                        />
                    </Animated.View>
                </GestureDetector>

                {renderControls()}

                <Modal
                    visible={errorModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={handleCloseErrorModal}
                    statusBarTranslucent={true}
                >
                    <View style={styles.modalContainer}>
                        <ErrorScreen
                            errorMessage={cameraError || ""}
                            onGoBack={handleCloseErrorModal}
                        />
                    </View>
                </Modal>
            </SafeAreaView>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
    },
    cameraContainer: {
        alignSelf: "center",
        width: screenWidth,
        height: (screenWidth * 4) / 3,
        overflow: "hidden",
        borderRadius: sizes.moment.standart.borderRadius * 0.8,
        backgroundColor: "#111",
    },
    camera: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    controlsContainer: {
        marginTop: sizes.margins["1md"],
        alignItems: "center",
    },
    captureButtonsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "90%",
        paddingHorizontal: 20,
    },
    controlButton: {
        padding: 15,
        borderRadius: 30,
        backgroundColor: "rgba(40, 40, 40, 0.8)",
    },
})

export default CameraScreen
