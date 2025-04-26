import { Component, useCallback, useState } from "react" // Remover useRef
import { DeviceEventEmitter, findNodeHandle, NativeMethods, UIManager } from "react-native" // Remover LayoutRectangle
// Remover imports de Gesture e runOnJS

import { CAMERA_COMMANDS } from "../core/CameraCommands"
import { useCamera } from "../core/CameraContext"
import { FlashMode, PhotoResult, RCTCameraViewProps } from "../types/camera.types" // Importar RCTCameraViewProps

interface UseCameraFunctionsProps {
    // Ajustar tipo da ref aqui também
    viewRef: React.RefObject<Component<RCTCameraViewProps> & Readonly<NativeMethods>>
    onPhotoTaken?: () => void // Manter callback para animação
}

interface UseCameraFunctionsResult {
    // Estado
    error: string | null
    // cameraReady: boolean // REMOVER
    flashMode: FlashMode

    // Funções de manipulação de estado
    setError: (error: string | null) => void
    // setCameraReady: (ready: boolean) => void // REMOVER

    // Funções da câmera
    initialize: () => Promise<void>
    handleCameraError: (event: { nativeEvent: { error: string } }) => void
    // handleCameraReady: () => void // REMOVER
    handleSwitchCamera: () => void
    handleToggleFlash: () => void
    takePhoto: () => Promise<PhotoResult>
    handleTakePhoto: () => Promise<void>
    // Remover setVerticalOrientation
}

export const useCameraFunctions = ({
    viewRef,
    onPhotoTaken, // Receber o callback
}: UseCameraFunctionsProps): UseCameraFunctionsResult => {
    const camera = useCamera()

    // Estado da câmera
    const [error, setError] = useState<string | null>(null)
    // const [cameraReady, setCameraReady] = useState(false) // REMOVER
    // Remover cameraType se não usar na UI
    // const [cameraType, setCameraType] = useState<CameraType>("back");
    const [flashMode, setFlashMode] = useState<FlashMode>("off")

    // Manter dispatchCommand
    const dispatchCommand = useCallback(
        (commandId: number, args: Array<unknown> = []) => {
            try {
                const reactTag = findNodeHandle(viewRef.current)
                if (reactTag && commandId !== -1) {
                    UIManager.dispatchViewManagerCommand(reactTag, commandId as number, args)
                } else if (commandId === -1) {
                    console.warn(
                        "[Camera] Tentativa de executar um comando inválido ou não disponível"
                    )
                }
            } catch (err) {
                console.error("[Camera] Erro ao enviar comando para a view nativa:", err)
            }
        },
        [viewRef]
    )

    // Remover setVerticalOrientation
    // const setVerticalOrientation = useCallback(() => {
    //     console.warn("[CameraX] setVerticalOrientation pode não ser necessário ou funcionar como esperado.");
    //     // if (CAMERA_COMMANDS.setOrientation !== -1) { dispatchCommand(...) }
    //     // if (CAMERA_COMMANDS.adjustCameraImage !== -1) { dispatchCommand(...) }
    // }, [dispatchCommand]);

    // Manter initialize, mas remover chamada a setVerticalOrientation
    const initialize = useCallback(async () => {
        try {
            await camera.initialize()
            // setVerticalOrientation() // Remover
        } catch (e) {
            console.error("[Camera] Erro ao inicializar câmera:", e)
            setError(e instanceof Error ? e.message : String(e))
        }
    }, [camera]) // Remover dependência

    // Manter handleCameraError
    const handleCameraError = useCallback((event: { nativeEvent: { error: string } }) => {
        const errorMsg = event.nativeEvent.error
        console.error(`[Camera] Erro recebido do componente nativo: ${errorMsg}`)
        setError(errorMsg)
    }, [])

    // Manter handleSwitchCamera
    const handleSwitchCamera = useCallback(() => {
        if (CAMERA_COMMANDS.switchCamera !== -1) {
            dispatchCommand(CAMERA_COMMANDS.switchCamera)
            console.log("[CameraX] Comando switchCamera despachado.")
        }
    }, [dispatchCommand])

    // Manter handleToggleFlash
    const handleToggleFlash = useCallback(() => {
        let newFlashMode: FlashMode
        switch (flashMode) {
            case "off":
                newFlashMode = "on"
                break
            case "on":
                newFlashMode = "auto"
                break
            case "auto":
                newFlashMode = "off"
                break // Simplificado: remover torch por enquanto
            default:
                newFlashMode = "off"
        }
        setFlashMode(newFlashMode)
        // REMOVER CHAMADA DIRETA AO MÓDULO
        // A prop flashMode no ViewManager cuidará de chamar o método nativo
        // camera.setFlashMode(newFlashMode).catch((error) => {
        //     console.error("[Camera] Erro ao definir modo de flash no módulo nativo:", error)
        // })
        console.log(`[CameraX] Modo do flash UI alterado para: ${newFlashMode}`)
        return newFlashMode
    }, [flashMode]) // Remover 'camera' das dependências se não for mais usado aqui

    // Manter takePhoto
    const takePhoto = useCallback((): Promise<PhotoResult> => {
        return new Promise((resolve, reject) => {
            const subscription = DeviceEventEmitter.addListener("onTakePhoto", (event) => {
                console.log("CameraFunctions", "Evento onTakePhoto (JS) recebido:", event)
                subscription.remove()
                errorSubscription.remove() // Remover listener de erro também
                resolve({
                    path: event.path,
                    width: event.width,
                    height: event.height,
                })
            })

            const errorSubscription = DeviceEventEmitter.addListener("onError", (event) => {
                console.error(
                    "CameraFunctions",
                    "Evento onError (JS) recebido ao tirar foto:",
                    event
                )
                subscription.remove()
                errorSubscription.remove()
                reject(new Error(event.error || "Erro desconhecido ao tirar foto"))
            })

            if (CAMERA_COMMANDS.takePhoto !== -1) {
                console.log("CameraFunctions", "Despachando comando takePhoto...")
                dispatchCommand(CAMERA_COMMANDS.takePhoto)
            } else {
                console.error("CameraFunctions", "Comando takePhoto não disponível!")
                subscription.remove()
                errorSubscription.remove()
                reject(new Error("Comando takePhoto não disponível"))
            }

            // Timeout um pouco maior pode ser útil com CameraX
            setTimeout(() => {
                console.warn("CameraFunctions", "Timeout esperando evento onTakePhoto ou onError.")
                // Os listeners podem já ter sido removidos, então as chamadas a remove()
                // podem falhar, mas não precisamos fazer nada se isso acontecer.
                subscription.remove()
                errorSubscription.remove()
                reject(new Error("Timeout ao tirar foto"))
            }, 15000)
        })
    }, [dispatchCommand])

    // Remover verificação cameraReady
    const handleTakePhoto = useCallback(async () => {
        // if (!cameraReady) {
        //     console.warn("CameraFunctions", "handleTakePhoto chamado, mas camera não está pronta.");
        //     return;
        // }
        console.log("CameraFunctions", "handleTakePhoto chamado.")
        try {
            const photo = await takePhoto()
            console.log("CameraFunctions", "Foto tirada (JS):", photo)
            if (onPhotoTaken) {
                onPhotoTaken()
            }
            // Navegar ou processar a foto
        } catch (err) {
            console.error("CameraFunctions", "Erro ao tirar foto (JS):", err)
            setError(err instanceof Error ? err.message : String(err))
        }
    }, [takePhoto, setError, onPhotoTaken]) // Remover cameraReady das dependências

    return {
        error,
        // cameraReady, // REMOVER
        // Remover cameraType se estado foi removido
        flashMode,
        setError,
        // setCameraReady, // REMOVER
        initialize,
        handleCameraError,
        // handleCameraReady, // REMOVER
        handleSwitchCamera,
        handleToggleFlash,
        takePhoto,
        handleTakePhoto,
        // Remover setVerticalOrientation
    }
}

export default useCameraFunctions
