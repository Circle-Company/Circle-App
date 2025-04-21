/**
 * Tela principal da câmera
 *
 * Implementação direta da câmera usando RCTCameraView e CameraContext
 */
import { useFocusEffect } from "@react-navigation/native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    Dimensions,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
    requireNativeComponent,
} from "react-native"

import sizes from "@/layout/constants/sizes"
import CaptureButton from "../components/ui/buttons/capture"
import FlashButton from "../components/ui/buttons/flash"
import RotateButton from "../components/ui/buttons/rotate"
import ErrorScreen from "../components/ui/ErrorScreen"
import { useCamera } from "../core/CameraContext"
import useCameraFunctions from "../hooks/useCameraFunctions"
import { RCTCameraViewProps } from "../types/camera.types"

// Proporção fixa em 3:4 vertical (altura:largura)
const ASPECT_RATIO = 3 / 4 // Definir explicitamente como 3/4

// Dimensões da tela para calcular o tamanho da câmera
const screenWidth = Dimensions.get("window").width

// Importar o componente nativo diretamente
const RCTCameraView = requireNativeComponent<RCTCameraViewProps>("CircleCameraView")

const CameraScreen: React.FC = () => {
    const camera = useCamera()
    const viewRef = useRef(null)
    // Estado para controlar a visibilidade do modal de erro
    const [errorModalVisible, setErrorModalVisible] = useState(false)

    const {
        error,
        cameraType,
        flashMode,
        setError,
        initialize,
        handleCameraError,
        handleCameraReady,
        handleTakePhoto,
        handleToggleFlash,
        handleSwitchCamera,
    } = useCameraFunctions({ viewRef })

    useEffect(() => {
        initialize().catch(console.error)
        return () => {
            camera.stopCamera().catch(console.error)
        }
    }, [])

    // Atualiza o estado do modal de erro quando há um erro
    useEffect(() => {
        setErrorModalVisible(!!error)
    }, [error])

    // Função para fechar o modal de erro e limpar o erro
    const handleCloseErrorModal = useCallback(() => {
        setErrorModalVisible(false)
        setError(null)
    }, [setError])

    // Resetar o erro quando a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            setError(null)
        }, [setError])
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

            <View style={styles.cameraContainer}>
                <RCTCameraView
                    ref={viewRef}
                    style={styles.camera}
                    cameraType={cameraType}
                    flashMode={flashMode}
                    zoom={0}
                    maintainAspectRatio={true}
                    aspectRatio={ASPECT_RATIO}
                    onCameraReady={handleCameraReady}
                    onError={handleCameraError}
                />
            </View>

            {renderControls()}

            {/* Modal de erro */}
            <Modal
                visible={errorModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseErrorModal}
                statusBarTranslucent={true}
            >
                <View style={styles.modalContainer}>
                    <ErrorScreen errorMessage={error || ""} onGoBack={handleCloseErrorModal} />
                </View>
            </Modal>
        </SafeAreaView>
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
        width: screenWidth,
        height: screenWidth * ASPECT_RATIO, // Usar a mesma proporção que passamos para o componente nativo
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
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
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
        backgroundColor: "rgba(40, 40, 40, 0.8)",
    },
})

export default CameraScreen
