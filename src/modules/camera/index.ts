/**
 * Módulo de Câmera
 * ---------------
 * Este módulo fornece uma implementação de câmera para React Native
 * com suporte a fotos, vídeos e funcionalidades nativas.
 *
 * Versão refatorada: implementação direta utilizando o componente nativo
 * e o CameraContext para gerenciamento de estado.
 */

// Exportar o contexto e hook para acesso global
export { CameraProvider, useCamera } from "./core/CameraContext"

// Exportar tela principal
export { default as CameraScreen } from "./screens/CameraScreen"

// Exportar componentes de UI
export { default as CaptureButton } from "./components/ui/buttons/capture"
export { default as FlashButton } from "./components/ui/buttons/flash"
export { default as RotateButton } from "./components/ui/buttons/rotate"
export { default as ErrorScreen } from "./components/ui/ErrorScreen"

// Exportar hooks
export { default as useCameraFunctions } from "./hooks/useCameraFunctions"

// Exportar utilitários e recursos da câmera
export { CAMERA_COMMANDS, getCommandId } from "./core/CameraCommands"

// Exportar tipos básicos da câmera
export type {
    CameraFlashMode,
    CameraType,
    FlashMode,
    RCTCameraViewProps,
} from "./types/camera.types"
