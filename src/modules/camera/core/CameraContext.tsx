import React, { createContext, useContext, useEffect, useState } from "react"
import { PermissionsAndroid, Platform } from "react-native"
import { CameraType, FlashMode, PhotoResult } from "../types/camera.types"
import { NativeCamera } from "./NativeInterface"

interface CameraContextProps {
    // Estado
    isInitialized: boolean
    isActive: boolean
    error: Error | null
    flashMode: FlashMode
    cameraType: CameraType
    zoom: number

    // Métodos
    initialize: () => Promise<void>
    startCamera: () => Promise<void>
    stopCamera: () => Promise<void>
    takePhoto: () => Promise<PhotoResult>
    switchCamera: () => Promise<void>
    setFlashMode: (mode: FlashMode) => Promise<void>
    setZoom: (zoom: number) => Promise<void>
    setFocusPoint: (x: number, y: number) => Promise<void>
}

const defaultContext: CameraContextProps = {
    isInitialized: false,
    isActive: false,
    error: null,
    flashMode: "off",
    cameraType: "back",
    zoom: 0,

    initialize: async () => {},
    startCamera: async () => {},
    stopCamera: async () => {},
    takePhoto: async () => ({ path: "", width: 0, height: 0 }),
    switchCamera: async () => {},
    setFlashMode: async () => {},
    setZoom: async () => {},
    setFocusPoint: async () => {},
}

const CameraContext = createContext<CameraContextProps>(defaultContext)

export const useCamera = () => useContext(CameraContext)

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [flashMode, setFlashModeState] = useState<FlashMode>("off")
    const [cameraType, setCameraType] = useState<CameraType>("back")
    const [zoom, setZoomState] = useState(0)

    // Solicitar permissões de câmera
    const requestCameraPermissions = async (): Promise<boolean> => {
        if (Platform.OS === "android") {
            try {
                // Verifique primeiro se já temos as permissões antes de solicitá-las
                const cameraStatus = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                )
                const audioStatus = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
                )

                if (cameraStatus && audioStatus) {
                    console.log("[Camera] Já temos todas as permissões necessárias")
                    return true
                }

                console.log("[Camera] Solicitando permissões de câmera e áudio...")

                // Solicite as permissões uma de cada vez para melhorar a experiência do usuário
                const cameraPermission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Permissão de Câmera",
                        message:
                            "O aplicativo precisa acessar sua câmera para tirar fotos e gravar vídeos.",
                        buttonPositive: "OK",
                        buttonNegative: "Cancelar",
                    }
                )

                if (cameraPermission !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.error("[Camera] Permissão de câmera negada!")
                    return false
                }

                const audioPermission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: "Permissão de Microfone",
                        message:
                            "O aplicativo precisa acessar seu microfone para gravar vídeos com áudio.",
                        buttonPositive: "OK",
                        buttonNegative: "Cancelar",
                    }
                )

                // Não solicitar permissão de armazenamento em Android 10+ (API nível 29+)
                // pois não é mais necessário para salvar arquivos no diretório DCIM/Pictures
                let storagePermission = PermissionsAndroid.RESULTS.GRANTED

                if (Platform.Version < 29) {
                    storagePermission = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            title: "Permissão de Armazenamento",
                            message:
                                "O aplicativo precisa acessar seu armazenamento para salvar fotos e vídeos.",
                            buttonPositive: "OK",
                            buttonNegative: "Cancelar",
                        }
                    )
                }

                const permissionsGranted =
                    cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
                    audioPermission === PermissionsAndroid.RESULTS.GRANTED &&
                    storagePermission === PermissionsAndroid.RESULTS.GRANTED

                console.log("[Camera] Resultado das permissões:", {
                    camera: cameraPermission === PermissionsAndroid.RESULTS.GRANTED,
                    audio: audioPermission === PermissionsAndroid.RESULTS.GRANTED,
                    storage: storagePermission === PermissionsAndroid.RESULTS.GRANTED,
                    todas: permissionsGranted,
                })

                return permissionsGranted
            } catch (err) {
                console.error("[Camera] Erro ao solicitar permissões de câmera:", err)
                return false
            }
        } else {
            // No iOS, as permissões são solicitadas automaticamente quando a câmera é inicializada
            return true
        }
    }

    // Inicializar a câmera e configurar
    const initialize = async () => {
        try {
            // Verificar permissões primeiro
            const hasPermissions = await requestCameraPermissions()

            if (!hasPermissions) {
                console.warn("[Camera] Permissões de câmera não concedidas. Usando modo simulado.")
                // Mesmo sem permissões, continuamos para usar o modo simulado
            }

            // Inicializar módulo nativo
            const success = await NativeCamera.initialize().catch((error) => {
                console.warn(
                    "[Camera] Erro ao inicializar câmera nativa, usando modo simulado:",
                    error
                )
                return true // Retorna true mesmo com erro para permitir o modo simulado continuar
            })

            if (!success) {
                console.warn(
                    "[Camera] Usando modo simulado de câmera devido a falha na inicialização"
                )
            }

            setIsInitialized(true)
            setError(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            console.error("[Camera] Erro ao inicializar a câmera:", error)
            setError(error)

            // Mesmo com erro, vamos definir como inicializado para o modo simulado funcionar
            setIsInitialized(true)
        }
    }

    const startCamera = async () => {
        if (!isInitialized) {
            await initialize()
        }

        try {
            // Verificar permissões antes de iniciar a câmera
            const hasPermissions = await requestCameraPermissions()

            if (!hasPermissions) {
                console.warn("[Camera] Permissões de câmera não concedidas. Usando modo simulado.")
                // Definir como ativo mesmo sem permissões para usar o modo simulado
                setIsActive(true)
                return
            }

            const success = await NativeCamera.startCamera().catch((error) => {
                console.warn("[Camera] Erro ao iniciar câmera, usando modo simulado:", error)
                return true // Permitir continuar em modo simulado
            })

            if (success) {
                setIsActive(true)
            } else {
                console.warn("[Camera] Usando modo simulado de câmera")
                setIsActive(true) // Ativar mesmo assim para o modo simulado
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            console.error("[Camera] Erro ao iniciar a câmera:", error)
            setError(error)

            // Ativar mesmo com erro para o modo simulado funcionar
            setIsActive(true)
        }
    }

    const stopCamera = async () => {
        try {
            const success = await NativeCamera.stopCamera().catch((error) => {
                console.warn("[Camera] Erro ao parar câmera:", error)
                return true
            })

            if (success) {
                setIsActive(false)
            }
        } catch (err) {
            console.error("[Camera] Erro ao parar a câmera:", err)
            // Desativa mesmo com erro
            setIsActive(false)
        }
    }

    const takePhoto = async () => {
        try {
            if (!isActive) {
                await startCamera()
            }
            return await NativeCamera.takePhoto()
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            console.error("[Camera] Erro ao tirar foto:", error)
            setError(error)
            return { path: "", width: 0, height: 0 }
        }
    }

    const switchCamera = async () => {
        try {
            await NativeCamera.switchCamera()
            setCameraType((prevType) => (prevType === "back" ? "front" : "back"))
        } catch (err) {
            console.error("[Camera] Erro ao alternar câmera:", err)
        }
    }

    const setFlashMode = async (mode: FlashMode) => {
        try {
            // Chama o método setFlashMode do módulo nativo
            await NativeCamera.setFlashMode(mode)
            setFlashModeState(mode)
            console.log(`[Camera] Modo de flash definido para: ${mode}`)
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            console.error("[Camera] Erro ao definir modo de flash:", error)
            // Definir o estado mesmo com erro, para que a UI reflita o modo atual
            setFlashModeState(mode)
        }
    }

    const setZoom = async (zoomValue: number) => {
        try {
            // Garantir que o zoom esteja entre 0 e 1
            const clampedZoom = Math.max(0, Math.min(1, zoomValue))
            await NativeCamera.setZoom(clampedZoom)
            setZoomState(clampedZoom)
        } catch (err) {
            console.error("[Camera] Erro ao definir zoom:", err)
        }
    }

    const setFocusPoint = async (x: number, y: number) => {
        try {
            await NativeCamera.setFocusPoint(x, y)
        } catch (err) {
            console.error("[Camera] Erro ao definir ponto de foco:", err)
        }
    }

    // Inicializar a câmera automaticamente quando o provider for montado
    useEffect(() => {
        initialize().catch((error) => {
            console.warn("[Camera] Erro na inicialização automática da câmera:", error)
        })

        // Limpar recursos ao desmontar
        return () => {
            if (isActive) {
                stopCamera().catch((error) => {
                    console.warn("[Camera] Erro ao limpar recursos da câmera:", error)
                })
            }
        }
    }, [])

    const contextValue: CameraContextProps = {
        isInitialized,
        isActive,
        error,
        flashMode,
        cameraType,
        zoom,

        initialize,
        startCamera,
        stopCamera,
        takePhoto,
        switchCamera,
        setFlashMode,
        setZoom,
        setFocusPoint,
    }

    return <CameraContext.Provider value={contextValue}>{children}</CameraContext.Provider>
}

export default CameraContext
