/**
 * Componente nativo da câmera
 *
 * Este arquivo implementa o wrapper React Native para o componente nativo CircleCameraView
 */
import { requireNativeComponent } from "react-native"
import { RCTCameraViewProps } from "../types/camera.types"

/**
 * Componente de câmera nativo
 *
 * Utiliza o componente nativo CircleCameraView implementado em Java/Kotlin no Android
 * e em Objective-C/Swift no iOS
 */
const RCTCameraView = requireNativeComponent<RCTCameraViewProps>("CircleCameraView")

export default RCTCameraView
