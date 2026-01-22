import React from "react"
import * as Location from "expo-location"
import PersistedContext from "./Persisted"

interface UpdateCoordinatesPayload {
    latitude: number
    longitude: number
}

type GeolocationProviderProps = { children: React.ReactNode }
export type GeolocationContextsData = {
    updateUserLocation: () => Promise<void>
    isUpdating: boolean
}

// Contexto
const GeolocationContext = React.createContext<GeolocationContextsData>(
    {} as GeolocationContextsData,
)

export function Provider({ children }: GeolocationProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [isUpdating, setIsUpdating] = React.useState(false)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
    const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000 // 5 minutos em milissegundos

    // Função para solicitar permissão
    const requestLocationPermission = async (): Promise<boolean> => {
        try {
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync()

            if (foregroundStatus !== "granted") {
                console.warn("Permissão de localização negada")
                return false
            }

            return true
        } catch (error) {
            console.error("Erro ao solicitar permissão de localização:", error)
            return false
        }
    }

    // Função para atualizar a localização do usuário
    const updateUserCoordinates = async (payload: UpdateCoordinatesPayload): Promise<void> => {
        if (session.user.id) {
            try {
                // A api ainda não recebe coordenadas do usuário
                /**
                    await apiRoutes.account.updateCoordinates({
                        userId: session?.user?.id,
                        coordinates: {
                            latitude: payload.latitude,
                            longitude: payload.longitude,
                        },
                    })
                 */

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

    // Função para obter e atualizar a localização do usuário
    const UseUpdateUserLocation = async () => {
        const hasPermission = await requestLocationPermission()
        if (!hasPermission) throw new Error("Location permission is not granted")

        setIsUpdating(true)

        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 15000,
                distanceInterval: 0,
            })

            const { latitude, longitude } = location.coords

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

    // Inicia o intervalo para atualização a cada 5 minutos
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
        }
    }, [])

    /**
    // Verifica se o usuário está logado e inicia o processo
    React.useEffect(() => {
        const checkUserAndStartUpdating = async () => {
            // Verifica se temos dados do usuário na memória
            if (session.user.id) {
                console.log(
                    `🔄 Iniciando serviço de localização para usuário ID: ${session.user.id}`,
                )
                try {
                    // Atualiza a localização imediatamente
                    await updateUserLocation()

                    // Inicia o intervalo para atualizações periódicas
                    startLocationUpdateInterval()
                } catch (error) {
                    console.error("Error in initial location update:", error)
                }
            } else {
                console.log(
                    "⚠️ Usuário não encontrado na memória, serviço de localização não iniciado",
                )
            }
        }

        checkUserAndStartUpdating()
    }, [session.user.id]) // Dependência na ID do usuário para reiniciar quando mudar
    */

    const contextValue: GeolocationContextsData = {
        updateUserLocation,
        isUpdating,
    }

    return (
        <GeolocationContext.Provider value={contextValue}>{children}</GeolocationContext.Provider>
    )
}

export default GeolocationContext
