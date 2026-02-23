import React from "react"
import * as Location from "expo-location"
import * as TaskManager from "expo-task-manager"
import PersistedContext from "./Persisted"
import { useUpdateAccCoordsMutation, updateAccountCoordinates } from "@/queries"
import { Linking, AppState } from "react-native"

const BACKGROUND_LOCATION_TASK = "BACKGROUND_LOCATION_TASK"

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error("Background location task error:", error)
        return
    }
    const { locations } = (data || {}) as { locations?: Location.LocationObject[] }
    if (locations && locations.length > 0) {
        const { latitude, longitude } = locations[0].coords
        try {
            await updateAccountCoordinates({ lat: String(latitude), lng: String(longitude) })
        } catch (e) {
            console.error("📍 Failed to persist background location:", e)
        }
    }
})

interface UpdateCoordinatesPayload {
    latitude: number
    longitude: number
}

type GeolocationProviderProps = { children: React.ReactNode }
export type GeolocationContextsData = {
    updateUserLocation: () => Promise<void>
    isUpdating: boolean
    foregroundStatus: Location.PermissionStatus | null
    backgroundStatus: Location.PermissionStatus | null
    canAskAgainForeground: boolean
    canAskAgainBackground: boolean
    openSettings: () => Promise<void>
    refreshPermissions: () => Promise<void>
}

// Contexto
const GeolocationContext = React.createContext<GeolocationContextsData>(
    {} as GeolocationContextsData,
)

export function Provider({ children }: GeolocationProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const { mutateAsync: updateCoords, isPending } = useUpdateAccCoordsMutation()
    const [isUpdating, setIsUpdating] = React.useState(false)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
    const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000 // 5 minutos em milissegundos
    const [foregroundStatus, setForegroundStatus] =
        React.useState<Location.PermissionStatus | null>(null)
    const [backgroundStatus, setBackgroundStatus] =
        React.useState<Location.PermissionStatus | null>(null)
    const [canAskAgainForeground, setCanAskAgainForeground] = React.useState<boolean>(true)
    const [canAskAgainBackground, setCanAskAgainBackground] = React.useState<boolean>(true)

    const openSettings = React.useCallback(async () => {
        try {
            await Linking.openURL("app-settings:")
        } catch (e) {
            console.warn("Não foi possível abrir as configurações do sistema:", e)
        }
    }, [])

    const refreshPermissions = React.useCallback(async () => {
        try {
            const fg = await Location.getForegroundPermissionsAsync()
            setForegroundStatus(fg.status)
            setCanAskAgainForeground(fg.canAskAgain)

            const bg = await Location.getBackgroundPermissionsAsync()
            setBackgroundStatus(bg.status)
            setCanAskAgainBackground(bg.canAskAgain)
        } catch (e) {
            console.warn("Falha ao consultar permissões de localização:", e)
        }
    }, [])

    // Solicita permissões (foreground + background quando possível)
    const requestLocationPermission = async (): Promise<boolean> => {
        try {
            // Verifica serviços de localização
            const servicesEnabled = await Location.hasServicesEnabledAsync()
            if (!servicesEnabled) {
                console.warn("Serviços de localização desativados pelo usuário")
            }

            const fg = await Location.requestForegroundPermissionsAsync()
            setForegroundStatus(fg.status)
            setCanAskAgainForeground(fg.canAskAgain)
            if (fg.status !== "granted") {
                console.warn("Permissão de localização em primeiro plano negada")
                return false
            }

            // Solicita background depois do foreground
            let bg = await Location.getBackgroundPermissionsAsync()
            if (bg.status !== "granted") {
                bg = await Location.requestBackgroundPermissionsAsync()
            }
            setBackgroundStatus(bg.status)
            setCanAskAgainBackground(bg.canAskAgain)
            if (bg.status !== "granted") {
                console.warn("Permissão de localização em segundo plano não concedida")
                // iOS Allow Once: orientar usuário a abrir Settings via openSettings()
            }

            return true
        } catch (error) {
            console.error("Erro ao solicitar permissão de localização:", error)
            return false
        }
    }

    // Inicia atualizações de localização em background via TaskManager
    const startBackgroundLocationUpdates = async () => {
        try {
            const taskAvailable = await TaskManager.isAvailableAsync()
            if (!taskAvailable) {
                console.warn("TaskManager não está disponível neste ambiente")
                return
            }

            const servicesEnabled = await Location.hasServicesEnabledAsync()
            if (!servicesEnabled) {
                console.warn(
                    "Serviços de localização desativados; não iniciando background updates",
                )
                return
            }

            const fgPerm = await Location.getForegroundPermissionsAsync()
            if (fgPerm.status !== "granted") {
                console.warn("Permissão de localização em primeiro plano não concedida")
                return
            }

            const bgPerm = await Location.getBackgroundPermissionsAsync()
            if (bgPerm.status !== "granted") {
                console.warn("Permissão de localização em segundo plano não concedida")
                return
            }

            const bgAvailable = await Location.isBackgroundLocationAvailableAsync()
            if (!bgAvailable) {
                console.warn(
                    "Background location não está disponível neste dispositivo/configuração",
                )
                return
            }

            const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
            if (started) return

            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                // Frequência e precisão
                accuracy: Location.Accuracy.High,
                timeInterval: LOCATION_UPDATE_INTERVAL,
                distanceInterval: 50,
                // iOS: atualizações diferidas para economia de bateria quando em background
                deferredUpdatesInterval: LOCATION_UPDATE_INTERVAL,
                deferredUpdatesDistance: 50,
                pausesUpdatesAutomatically: true,
                showsBackgroundLocationIndicator: true,
                activityType: Location.ActivityType.Fitness,
                // Android: notificação do serviço em primeiro plano
                foregroundService: {
                    notificationTitle: "Location Service",
                    notificationBody: "Atualizando sua localização em segundo plano",
                },
            })
            console.log("✅ Background location updates started")
        } catch (e) {
            console.error("Erro ao iniciar background location updates:", e)
        }
    }

    const stopBackgroundLocationUpdates = async () => {
        try {
            const taskAvailable = await TaskManager.isAvailableAsync()
            if (!taskAvailable) return
            const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
            if (started) {
                await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
                console.log("🛑 Background location updates stopped")
            }
        } catch (e) {
            console.error("Erro ao parar background location updates:", e)
        }
    }

    // Função para atualizar a localização do usuário (foreground/manual)
    const updateUserCoordinates = async (payload: UpdateCoordinatesPayload): Promise<void> => {
        if (session.user.id) {
            try {
                await updateCoords({
                    lat: String(payload.latitude),
                    lng: String(payload.longitude),
                })

                session.account.setCoordinates({
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                })
            } catch (error) {
                console.error("Error updating coordinates:", error)
                throw error
            }
        }
    }

    // Função para obter e atualizar a localização do usuário (one-shot)
    const UseUpdateUserLocation = async () => {
        const fg = await Location.getForegroundPermissionsAsync()
        if (fg.status !== "granted") throw new Error("Location permission is not granted")

        setIsUpdating(true)

        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 15000,
                distanceInterval: 0,
                mayShowUserSettingsDialog: true,
            })

            const { latitude, longitude } = location.coords

            await updateCoords({ lat: String(latitude), lng: String(longitude) })
            await updateUserCoordinates({ latitude, longitude })
            setIsUpdating(false)
        } catch (error) {
            setIsUpdating(false)
            console.error("Error getting location:", error)
            throw error
        }
    }

    const updateUserLocation = async (): Promise<void> => {
        if (!session.user.id) {
            throw new Error("User ID is not available")
        }
        await UseUpdateUserLocation()
    }

    // Inicia o intervalo para atualização a cada 5 minutos (foreground)
    const startLocationUpdateInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
            console.log(
                `⏰ Executando atualização periódica de localização (intervalo de ${
                    LOCATION_UPDATE_INTERVAL / 60000
                } minutos)`,
            )
            updateUserLocation().catch((error) => {
                console.error("Error updating location in interval:", error)
            })
        }, LOCATION_UPDATE_INTERVAL)
        console.log(
            `⏱️ Intervalo de atualização de localização iniciado: a cada ${
                LOCATION_UPDATE_INTERVAL / 60000
            } minutos`,
        )
    }

    // Limpa o intervalo quando o componente é desmontado
    React.useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            // Para segurança, interrompe task de background ao desmontar o provider
            stopBackgroundLocationUpdates().catch(() => {})
        }
    }, [])

    // Inicializa estado de permissões (iOS-friendly Allow Once)
    React.useEffect(() => {
        refreshPermissions()
    }, [refreshPermissions])

    // Atualiza localização ao entrar no app (voltar para foreground)
    const appState = React.useRef(AppState.currentState)
    React.useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextState) => {
            const prevState = appState.current
            appState.current = nextState
            if (
                (prevState === "inactive" || prevState === "background") &&
                nextState === "active"
            ) {
                if (session.user.id && !isUpdating) {
                    updateUserLocation().catch((err) => {
                        console.warn(
                            "Falha ao atualizar localização ao voltar para foreground:",
                            err,
                        )
                    })
                }
            }
        })
        return () => {
            subscription.remove()
        }
    }, [session.user.id, isUpdating, updateUserLocation])

    // Verifica se o usuário está logado e inicia o processo (FG + BG)
    React.useEffect(() => {
        const checkUserAndStartUpdating = async () => {
            // Verifica se temos dados do usuário na memória
            if (session.user.id) {
                console.log(
                    `🔄 Iniciando serviço de localização para usuário ID: ${session.user.id}`,
                )
                try {
                    // Apenas consulta o status; não solicita permissão automaticamente
                    await refreshPermissions()
                    const fg = await Location.getForegroundPermissionsAsync()
                    const bg = await Location.getBackgroundPermissionsAsync()
                    if (fg.status !== "granted") {
                        // Sem permissão: não iniciar fluxos
                        return
                    }

                    // Atualiza a localização imediatamente
                    await updateUserLocation()

                    // Inicia o intervalo para atualizações em foreground
                    startLocationUpdateInterval()

                    // Inicia atualizações em background somente se já concedida
                    if (bg.status === "granted") {
                        await startBackgroundLocationUpdates()
                    }
                } catch (error) {
                    console.error("Error in initial location update:", error)
                }
            } else {
                console.log(
                    "⚠️ Usuário não encontrado na memória, serviço de localização não iniciado",
                )
                // Sem usuário logado: parar BG updates
                stopBackgroundLocationUpdates().catch(() => {})
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
            }
        }

        checkUserAndStartUpdating()
        // Dependência na ID do usuário para reiniciar quando mudar
    }, [session.user.id])

    const contextValue: GeolocationContextsData = {
        updateUserLocation,
        isUpdating,
        foregroundStatus,
        backgroundStatus,
        canAskAgainForeground,
        canAskAgainBackground,
        openSettings,
        refreshPermissions,
    }

    return (
        <GeolocationContext.Provider value={contextValue}>{children}</GeolocationContext.Provider>
    )
}

export default GeolocationContext
