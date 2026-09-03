import React from "react"
import * as BackgroundTask from "expo-background-task"
import * as Location from "expo-location"
import * as TaskManager from "expo-task-manager"
import { AppState, Linking } from "react-native"

import PersistedContext from "./Persisted"
import { updateAccountCoordinates, useUpdateAccCoordsMutation } from "@/queries"
import { safeSet, storage, storageKeys } from "@/store"

/**
 * Sincronização de localização sem a permissão "Always".
 *
 * O app pede apenas `When In Use`. Em background usamos um BGProcessingTask que
 * lê a ÚLTIMA POSIÇÃO CONHECIDA em cache do sistema (`getLastKnownPositionAsync`)
 * — isso não liga o GPS e por isso não exige `Always` nem mostra o indicador
 * azul. É best-effort: o SO decide quando rodar a task.
 */
const LOCATION_SYNC_TASK = "LOCATION_SYNC_TASK"

/** Intervalo do timer de foreground (app aberto). */
const FOREGROUND_UPDATE_INTERVAL = 5 * 60 * 1000
/** Piso do agendamento em background, em MINUTOS (API do expo-background-task). */
const BACKGROUND_MINIMUM_INTERVAL = 15
/** Idade máxima aceitável para a posição em cache lida em background. */
const LAST_KNOWN_MAX_AGE = 30 * 60 * 1000
/** Não reenvia coordenadas ao servidor mais de uma vez a cada 4 min. */
const SYNC_THROTTLE = 4 * 60 * 1000

function isLoggedIn(): boolean {
    try {
        return Boolean(storage.getString(storageKeys().account.jwt.token))
    } catch {
        return false
    }
}

function shouldSync(): boolean {
    try {
        const last = storage.getNumber(storageKeys().account.coordinates.lastSyncAt)
        if (!last) return true
        return Date.now() - last >= SYNC_THROTTLE
    } catch {
        return true
    }
}

function markSynced() {
    safeSet(storageKeys().account.coordinates.lastSyncAt, Date.now())
}

/**
 * Task headless: roda fora do React, sem acesso a hooks. Usa a função pura
 * `updateAccountCoordinates` — o interceptor do axios lê o JWT direto do MMKV.
 */
TaskManager.defineTask(LOCATION_SYNC_TASK, async () => {
    try {
        if (!isLoggedIn()) return BackgroundTask.BackgroundTaskResult.Success

        const { status } = await Location.getForegroundPermissionsAsync()
        if (status !== "granted") return BackgroundTask.BackgroundTaskResult.Success

        // Cache do SO — não ativa o serviço de localização.
        const position = await Location.getLastKnownPositionAsync({
            maxAge: LAST_KNOWN_MAX_AGE,
        })
        if (!position) return BackgroundTask.BackgroundTaskResult.Success

        const { latitude, longitude } = position.coords
        await updateAccountCoordinates({ lat: String(latitude), lng: String(longitude) })
        markSynced()
        console.log("📍 Localização sincronizada em background")
        return BackgroundTask.BackgroundTaskResult.Success
    } catch (e) {
        console.error("📍 Falha ao sincronizar localização em background:", e)
        return BackgroundTask.BackgroundTaskResult.Failed
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
    canAskAgainForeground: boolean
    requestForegroundPermission: () => Promise<boolean>
    openSettings: () => Promise<void>
    refreshPermissions: () => Promise<void>
}

const GeolocationContext = React.createContext<GeolocationContextsData>(
    {} as GeolocationContextsData,
)

export function Provider({ children }: GeolocationProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const { mutateAsync: updateCoords } = useUpdateAccCoordsMutation()
    const [isUpdating, setIsUpdating] = React.useState(false)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
    const [foregroundStatus, setForegroundStatus] =
        React.useState<Location.PermissionStatus | null>(null)
    const [canAskAgainForeground, setCanAskAgainForeground] = React.useState<boolean>(true)

    const openSettings = React.useCallback(async () => {
        try {
            if (typeof (Linking as any).openSettings === "function") {
                await (Linking as any).openSettings()
                return
            }
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
        } catch (e) {
            console.warn("Falha ao consultar permissão de localização:", e)
        }
    }, [])

    /** Pede apenas `When In Use`. Nunca pedimos background/Always. */
    const requestForegroundPermission = React.useCallback(async (): Promise<boolean> => {
        try {
            const servicesEnabled = await Location.hasServicesEnabledAsync()
            if (!servicesEnabled) {
                console.warn("Serviços de localização desativados pelo usuário")
            }

            const fg = await Location.requestForegroundPermissionsAsync()
            setForegroundStatus(fg.status)
            setCanAskAgainForeground(fg.canAskAgain)
            return fg.status === "granted"
        } catch (error) {
            console.error("Erro ao solicitar permissão de localização:", error)
            return false
        }
    }, [])

    // ---- Background sync (BGProcessingTask) --------------------------------

    const registerBackgroundSync = React.useCallback(async () => {
        try {
            if (!(await TaskManager.isAvailableAsync())) {
                console.warn("TaskManager não disponível neste ambiente")
                return
            }

            const status = await BackgroundTask.getStatusAsync()
            if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
                console.warn("Background task restrita pelo sistema")
                return
            }

            if (await TaskManager.isTaskRegisteredAsync(LOCATION_SYNC_TASK)) return

            await BackgroundTask.registerTaskAsync(LOCATION_SYNC_TASK, {
                minimumInterval: BACKGROUND_MINIMUM_INTERVAL,
            })
            console.log("✅ Sync de localização em background registrado")
        } catch (e) {
            console.error("Erro ao registrar background task de localização:", e)
        }
    }, [])

    const unregisterBackgroundSync = React.useCallback(async () => {
        try {
            if (!(await TaskManager.isAvailableAsync())) return
            if (!(await TaskManager.isTaskRegisteredAsync(LOCATION_SYNC_TASK))) return
            await BackgroundTask.unregisterTaskAsync(LOCATION_SYNC_TASK)
            console.log("🛑 Sync de localização em background cancelado")
        } catch (e) {
            console.error("Erro ao cancelar background task de localização:", e)
        }
    }, [])

    // ---- Foreground --------------------------------------------------------

    const updateUserCoordinates = async (payload: UpdateCoordinatesPayload): Promise<void> => {
        if (!session.user.id) return
        try {
            await updateCoords({
                lat: String(payload.latitude),
                lng: String(payload.longitude),
            })
            session.account.setCoordinates({
                latitude: payload.latitude,
                longitude: payload.longitude,
            })
            markSynced()
        } catch (error) {
            console.error("Error updating coordinates:", error)
            throw error
        }
    }

    const updateUserLocation = React.useCallback(
        async (force = false): Promise<void> => {
            if (!session.user.id) throw new Error("User ID is not available")

            const fg = await Location.getForegroundPermissionsAsync()
            if (fg.status !== "granted") throw new Error("Location permission is not granted")

            if (!force && !shouldSync()) return

            setIsUpdating(true)
            try {
                // Balanced basta para "pessoas por perto" e gasta bem menos bateria
                // que High.
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                    mayShowUserSettingsDialog: true,
                })
                const { latitude, longitude } = location.coords
                await updateUserCoordinates({ latitude, longitude })
            } catch (error) {
                console.error("Error getting location:", error)
                throw error
            } finally {
                setIsUpdating(false)
            }
        },
        [session.user.id],
    )

    const startLocationUpdateInterval = React.useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            updateUserLocation().catch((error) => {
                console.error("Error updating location in interval:", error)
            })
        }, FOREGROUND_UPDATE_INTERVAL)
    }, [updateUserLocation])

    // ---- Ciclo de vida -----------------------------------------------------

    React.useEffect(() => {
        refreshPermissions()
    }, [refreshPermissions])

    React.useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    // Atualiza ao voltar para o foreground.
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
                        console.warn("Falha ao atualizar localização ao voltar ao app:", err)
                    })
                }
            }
        })
        return () => subscription.remove()
    }, [session.user.id, isUpdating, updateUserLocation])

    // Liga/desliga o serviço conforme a sessão.
    React.useEffect(() => {
        const run = async () => {
            if (!session.user.id) {
                await unregisterBackgroundSync()
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
                return
            }

            try {
                await refreshPermissions()
                const fg = await Location.getForegroundPermissionsAsync()
                if (fg.status !== "granted") {
                    await unregisterBackgroundSync()
                    return
                }

                await updateUserLocation(true)
                startLocationUpdateInterval()
                await registerBackgroundSync()
            } catch (error) {
                console.error("Error in initial location update:", error)
            }
        }

        run()
    }, [session.user.id, foregroundStatus])

    const contextValue: GeolocationContextsData = {
        updateUserLocation: () => updateUserLocation(true),
        isUpdating,
        foregroundStatus,
        canAskAgainForeground,
        requestForegroundPermission,
        openSettings,
        refreshPermissions,
    }

    return (
        <GeolocationContext.Provider value={contextValue}>{children}</GeolocationContext.Provider>
    )
}

export default GeolocationContext
