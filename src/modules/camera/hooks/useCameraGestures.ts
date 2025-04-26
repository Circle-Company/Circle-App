import { Component, useCallback, useRef, useState } from "react"
import { findNodeHandle, LayoutRectangle, NativeMethods, UIManager } from "react-native"
import { Gesture } from "react-native-gesture-handler"
import { runOnJS } from "react-native-reanimated"

import { CAMERA_COMMANDS } from "../core/CameraCommands"
import { RCTCameraViewProps } from "../types/camera.types"

interface UseCameraGesturesProps {
    viewRef: React.RefObject<Component<RCTCameraViewProps> & Readonly<NativeMethods>>
    // Opcional: Sensibilidade do Zoom (0.1 a 1.0, por exemplo)
    zoomSensitivity?: number
}

interface UseCameraGesturesResult {
    zoomLevel: number
    composedGesture: ReturnType<typeof Gesture.Simultaneous>
    // Função para o CameraScreen informar as dimensões da view
    setViewDimensions: (dimensions: LayoutRectangle) => void
}

export const useCameraGestures = ({
    viewRef,
    zoomSensitivity = 0.5, // Sensibilidade padrão
}: UseCameraGesturesProps): UseCameraGesturesResult => {
    const [zoomLevel, setZoomLevel] = useState(0)
    const viewDimensions = useRef<LayoutRectangle | null>(null)
    const startZoom = useRef(0)

    // Callback para atualizar as dimensões da view
    const setViewDimensions = useCallback((dimensions: LayoutRectangle) => {
        viewDimensions.current = dimensions
        console.log("[Gestures] Dimensões da View definidas:", dimensions)
    }, [])

    // Função para despachar comandos (re-implementada aqui para encapsulamento)
    const dispatchCommand = useCallback(
        (commandId: number, args: Array<unknown> = []) => {
            try {
                const reactTag = findNodeHandle(viewRef.current)
                if (reactTag && commandId !== -1) {
                    UIManager.dispatchViewManagerCommand(reactTag, commandId as number, args)
                } else if (commandId === -1) {
                    console.warn(
                        "[Gestures] Tentativa de executar um comando inválido ou não disponível"
                    )
                }
            } catch (err) {
                console.error("[Gestures] Erro ao enviar comando para a view nativa:", err)
            }
        },
        [viewRef]
    )

    // --- Gestos ---

    // Gesto de Toque (Tap) para Foco
    const tapGesture = Gesture.Tap()
        .maxDuration(250)
        .onEnd((event) => {
            console.log(`[Gestures] Toque para Foco: x=${event.x}, y=${event.y}`)
            const currentDimensions = viewDimensions.current
            const focusCommandId = CAMERA_COMMANDS.setFocusPoint

            console.log(
                `[Gestures] Verificando foco: dimensions=${JSON.stringify(currentDimensions)}, commandId=${focusCommandId}`
            )

            if (currentDimensions && focusCommandId !== -1) {
                const normalizedX = event.x / currentDimensions.width
                const normalizedY = event.y / currentDimensions.height
                const clampedX = Math.max(0, Math.min(1, normalizedX))
                const clampedY = Math.max(0, Math.min(1, normalizedY))

                console.log(`[Gestures] Enviando foco para: x=${clampedX}, y=${clampedY}`)
                dispatchCommand(focusCommandId, [clampedX, clampedY])
            } else {
                console.warn(
                    "[Gestures] Dimensões da view não disponíveis ou comando setFocusPoint inválido para focar."
                )
            }
        })

    // Gesto de Pinça (Pinch) para Zoom
    const pinchGesture = Gesture.Pinch()
        .onBegin(() => {
            startZoom.current = zoomLevel // Salva o zoom atual no início
        })
        .onUpdate((event) => {
            const newZoom = startZoom.current + (event.scale - 1) * zoomSensitivity
            const clampedZoom = Math.max(0, Math.min(1, newZoom)) // Limita entre 0 e 1
            // Atualiza o estado JS (precisa do runOnJS)
            runOnJS(setZoomLevel)(clampedZoom)
        })

    // Combinar os gestos
    const composedGesture = Gesture.Simultaneous(pinchGesture, tapGesture)

    return {
        zoomLevel,
        composedGesture,
        setViewDimensions,
    }
}

export default useCameraGestures
