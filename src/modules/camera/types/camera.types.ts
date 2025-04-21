/**
 * Tipos comuns utilizados no módulo de câmera
 */
import { StyleProp, ViewStyle } from "react-native"

// Tipos básicos
export type CameraType = "front" | "back"
export type FlashMode = "on" | "off" | "auto" | "torch"
export type CameraFlashMode = FlashMode

export interface RCTCameraViewProps {
    style?: object
    cameraType?: CameraType
    flashMode?: FlashMode
    zoom?: number
    maintainAspectRatio?: boolean
    aspectRatio?: number
    onCameraReady?: (event: { nativeEvent: Record<string, unknown> }) => void
    onError?: (event: { nativeEvent: { error: string } }) => void
    onBarCodeRead?: (event: { nativeEvent: BarCodeReadEvent }) => void
    onFaceDetected?: (event: { nativeEvent: FaceDetection }) => void
    onTakePhoto?: (event: { nativeEvent: PhotoResult }) => void
}

// Interface para os eventos de código de barras
export interface BarCodeReadEvent {
    type: string
    data: string
}

// Interface para detecção facial
export interface FaceFeature {
    bounds: {
        size: {
            width: number
            height: number
        }
        origin: {
            x: number
            y: number
        }
    }
}

export interface FaceDetection {
    faces: FaceFeature[]
}

// Resultado da captura de foto
export interface PhotoResult {
    path: string
    width: number
    height: number
}

// Resultado da gravação de vídeo
export interface VideoResult {
    path: string
}

// Props comuns para componentes de câmera
export interface BaseCameraProps {
    style?: StyleProp<ViewStyle>
    cameraType?: CameraType
    flashMode?: FlashMode
    zoom?: number
    enableBarCodeScanning?: boolean
    enableFaceDetection?: boolean
    onCameraReady?: () => void
    onError?: (error: Error) => void
    onBarCodeRead?: (event: BarCodeReadEvent) => void
    onFaceDetected?: (faces: FaceDetection) => void
}

// Métodos comuns para refs de câmera
export interface BaseCameraRef {
    takePhoto: () => Promise<PhotoResult>
    startRecording: () => Promise<void>
    stopRecording: () => Promise<VideoResult>
    switchCamera: () => Promise<void>
    setFlashMode: (mode: FlashMode) => Promise<void>
    setZoom: (zoom: number) => Promise<void>
    setFocusPoint: (x: number, y: number) => Promise<void>
}

// Interface para o módulo nativo da câmera
export interface NativeCameraInterface {
    // Métodos de inicialização
    initialize(): Promise<boolean>
    startCamera(): Promise<void>
    stopCamera(): Promise<void>

    // Controles de câmera
    switchCamera(): Promise<void>
    toggleFlash(): Promise<void>
    setFlashMode(mode: FlashMode): Promise<void>
    setZoom(zoom: number): Promise<void>
    setFocus(focus: number): Promise<void>
    setFocusPoint(x: number, y: number): Promise<void>
    setExposureCompensation(value: number): Promise<void>
    setWhiteBalance(whiteBalance: string): Promise<void>

    // Captura de mídia
    takePhoto(): Promise<PhotoResult>
    startRecording(): Promise<void>
    stopRecording(): Promise<VideoResult>

    // Utilitários
    getFreeSpaceInBytes(): Promise<number>
    getCameraAvailableSizes(): Promise<string[]>
    getAvailableFilters(): Promise<string[]>
    supportsDynamicShaders(): Promise<boolean>
}
