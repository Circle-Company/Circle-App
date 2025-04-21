/**
 * Interface com o módulo nativo da câmera
 * Centraliza todas as chamadas para os métodos nativos e provê tipos corretos
 */
import { NativeModules, Platform } from "react-native"
import { FlashMode, PhotoResult, VideoResult } from "../types/camera.types"

// Interface para o módulo nativo
interface NativeCameraInterface {
    // Métodos de inicialização
    initialize(): Promise<boolean>
    startCamera(): Promise<void>
    stopCamera(): Promise<void>

    // Controles de câmera
    switchCamera(): Promise<void>
    toggleFlash(): Promise<void>
    setFlashMode(mode: FlashMode): Promise<void>
    setZoom(zoom: number): Promise<void>
    setFocusPoint(x: number, y: number): Promise<void>

    // Captura de mídia
    takePhoto(): Promise<PhotoResult>
    startRecording(): Promise<void>
    stopRecording(): Promise<VideoResult>

    // Utilitários
    getAvailableFilters(): Promise<string[]>
    supportsDynamicShaders(): Promise<boolean>
}

// Obter o módulo nativo
const CircleCameraModule = NativeModules.CircleCamera

// Criar interface para o módulo nativo da câmera
export const NativeCamera: NativeCameraInterface = {
    // Métodos de inicialização
    initialize: () => CircleCameraModule.initialize(),
    startCamera: () => CircleCameraModule.startCamera(),
    stopCamera: () => CircleCameraModule.stopCamera(),

    // Controles de câmera
    switchCamera: () => CircleCameraModule.switchCamera(),
    toggleFlash: () => CircleCameraModule.toggleFlash(),
    setFlashMode: (mode: FlashMode) => CircleCameraModule.setFlashMode(mode),
    setZoom: (zoom: number) => CircleCameraModule.setZoom(zoom),
    setFocusPoint: (x: number, y: number) => CircleCameraModule.setFocusPoint(x, y),

    // Captura de mídia
    takePhoto: () => CircleCameraModule.takePhoto(),
    startRecording: () => CircleCameraModule.startRecording(),
    stopRecording: () => CircleCameraModule.stopRecording(),

    // Utilitários
    getAvailableFilters: () => CircleCameraModule.getAvailableFilters(),
    supportsDynamicShaders: () => CircleCameraModule.supportsDynamicShaders(),
}

// Verificar se o módulo nativo está disponível
const { CircleCamera } = NativeModules

// Implementação simulada para quando o módulo nativo não está disponível
const MockCameraModule: NativeCameraInterface = {
    initialize: async () => {
        console.log("[Camera] Modo simulado: initialize")
        return Promise.resolve(true)
    },
    startCamera: async () => {
        console.log("[Camera] Modo simulado: startCamera")
        return Promise.resolve()
    },
    stopCamera: async () => {
        console.log("[Camera] Modo simulado: stopCamera")
        return Promise.resolve()
    },
    toggleFlash: async () => {
        console.log("[Camera] Modo simulado: toggleFlash")
        return Promise.resolve()
    },
    switchCamera: async () => {
        console.log("[Camera] Modo simulado: switchCamera")
        return Promise.resolve()
    },
    setFlashMode: async () => {
        console.log("[Camera] Modo simulado: setFlashMode")
        return Promise.resolve()
    },
    setZoom: async () => {
        console.log("[Camera] Modo simulado: setZoom")
        return Promise.resolve()
    },
    setFocusPoint: async () => {
        console.log("[Camera] Modo simulado: setFocusPoint")
        return Promise.resolve()
    },
    takePhoto: async () => {
        console.log("[Camera] Modo simulado: takePhoto")
        return Promise.resolve({ path: "file:///mock/photo.jpg", width: 1080, height: 1920 })
    },
    startRecording: async () => {
        console.log("[Camera] Modo simulado: startRecording")
        return Promise.resolve()
    },
    stopRecording: async () => {
        console.log("[Camera] Modo simulado: stopRecording")
        return Promise.resolve({ path: "file:///mock/video.mp4" })
    },
    getAvailableFilters: async () => {
        console.log("[Camera] Modo simulado: getAvailableFilters")
        return Promise.resolve(["normal", "grayscale", "sepia"])
    },
    supportsDynamicShaders: async () => {
        console.log("[Camera] Modo simulado: supportsDynamicShaders")
        return Promise.resolve(false)
    },
}

// Cria um módulo nativo, usando o simulado como fallback
const NativeCameraModule = CircleCamera || MockCameraModule

// Log que ajuda a depurar qual implementação está sendo usada
console.log(
    CircleCamera
        ? "[Camera] Usando módulo nativo de câmera"
        : `[Camera] Usando módulo simulado de câmera. Plataforma: ${Platform.OS}`
)

// Exportação padrão
export default NativeCameraModule
