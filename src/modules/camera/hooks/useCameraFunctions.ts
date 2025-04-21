/**
 * Hook para encapsular todas as funções da câmera
 *
 * Separa a lógica de manipulação da câmera da interface do usuário
 */
import { useCallback, useState } from "react"
import { DeviceEventEmitter, UIManager, findNodeHandle } from "react-native"
import { CAMERA_COMMANDS } from "../core/CameraCommands"
import { useCamera } from "../core/CameraContext"
import { CameraType, FlashMode, PhotoResult } from "../types/camera.types"

interface UseCameraFunctionsProps {
    viewRef: React.RefObject<unknown>
}

interface UseCameraFunctionsResult {
    // Estado
    error: string | null
    cameraReady: boolean
    cameraType: CameraType
    flashMode: FlashMode

    // Funções de manipulação de estado
    setError: (error: string | null) => void
    setCameraReady: (ready: boolean) => void

    // Funções da câmera
    initialize: () => Promise<void>
    handleCameraError: (event: { nativeEvent: { error: string } }) => void
    handleCameraReady: () => void
    handleSwitchCamera: () => void
    handleToggleFlash: () => void
    takePhoto: () => Promise<PhotoResult>
    handleTakePhoto: () => Promise<void>
}

/**
 * Hook que gerencia todas as funções de câmera separadas da UI
 */
export const useCameraFunctions = ({
    viewRef,
}: UseCameraFunctionsProps): UseCameraFunctionsResult => {
    const camera = useCamera()

    // Estado da câmera
    const [error, setError] = useState<string | null>(null)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraType, setCameraType] = useState<CameraType>("back")
    const [flashMode, setFlashMode] = useState<FlashMode>("off")

    // Função para executar comandos nativos na view
    const dispatchCommand = useCallback(
        (commandId: number, args: Array<unknown> = []) => {
            try {
                const reactTag = findNodeHandle(viewRef.current)
                if (reactTag && commandId !== -1) {
                    // @ts-ignore Sabemos que o reactTag é válido aqui
                    UIManager.dispatchViewManagerCommand(reactTag, commandId, args)
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

    // Inicialização
    const initialize = useCallback(async () => {
        try {
            await camera.initialize()
        } catch (e) {
            console.error("[Camera] Erro ao inicializar câmera:", e)
            setError(e instanceof Error ? e.message : String(e))
        }
    }, [camera])

    // Manipuladores de eventos
    const handleCameraError = useCallback((event: { nativeEvent: { error: string } }) => {
        const errorMsg = event.nativeEvent.error
        console.error(`[Camera] Erro recebido do componente nativo: ${errorMsg}`)
        setError(errorMsg)
    }, [])

    const handleCameraReady = useCallback(() => {
        setCameraReady(true)
    }, [])

    const handleSwitchCamera = useCallback(() => {
        const newCameraType = cameraType === "front" ? "back" : "front"
        setCameraType(newCameraType)
        dispatchCommand(CAMERA_COMMANDS.switchCamera)
    }, [cameraType, dispatchCommand])

    const handleToggleFlash = useCallback(() => {
        // Ciclo de modos do flash: off -> on -> auto -> torch -> off
        let newFlashMode: FlashMode
        switch (flashMode) {
            case "off":
                newFlashMode = "on"
                break
            case "on":
                newFlashMode = "auto"
                break
            case "auto":
                newFlashMode = "torch"
                break
            case "torch":
                newFlashMode = "off"
                break
            default:
                newFlashMode = "off"
        }

        // Atualizar o estado local
        setFlashMode(newFlashMode)

        // Enviar comando diretamente para a câmera nativa usando a prop do componente
        // A mudança será processada pelo método setFlashMode nativo do CircleCameraView.java

        // Se estiver usando o módulo nativo (para cases de testes ou simulações)
        camera.setFlashMode(newFlashMode).catch((error) => {
            console.error("[Camera] Erro ao definir modo de flash no módulo nativo:", error)
        })

        console.log(`[Camera] Modo do flash alterado para: ${newFlashMode}`)
        return newFlashMode
    }, [flashMode, camera])

    // Funções de mídia
    const takePhoto = useCallback((): Promise<PhotoResult> => {
        return new Promise((resolve, reject) => {
            const subscription = DeviceEventEmitter.addListener("onTakePhoto", (event) => {
                subscription.remove()
                resolve({
                    path: event.path,
                    width: event.width,
                    height: event.height,
                })
            })

            dispatchCommand(CAMERA_COMMANDS.takePhoto)

            // Timeout de segurança
            setTimeout(() => {
                subscription.remove()
                reject(new Error("Timeout ao tirar foto"))
            }, 10000)
        })
    }, [dispatchCommand])

    // Manipuladores de ação
    const handleTakePhoto = useCallback(async () => {
        if (!cameraReady) return

        try {
            const photo = await takePhoto()
            console.log("Foto tirada:", photo)
            // Aqui você pode navegar para uma tela de visualização da foto
        } catch (err) {
            console.error("Erro ao tirar foto:", err)
            setError(err instanceof Error ? err.message : String(err))
        }
    }, [cameraReady, takePhoto, setError])

    return {
        // Estado
        error,
        cameraReady,
        cameraType,
        flashMode,

        // Funções de manipulação de estado
        setError,
        setCameraReady,

        // Funções da câmera
        initialize,
        handleCameraError,
        handleCameraReady,
        handleSwitchCamera,
        handleToggleFlash,
        takePhoto,
        handleTakePhoto,
    }
}

export default useCameraFunctions
