import React from "react"
import Geolocation, { GeoError } from "react-native-geolocation-service"
import { PERMISSIONS, RESULTS, check, request } from "react-native-permissions"
import { apiRoutes } from "../services/Api"
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
    {} as GeolocationContextsData
)

export function Provider({ children }: GeolocationProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [isUpdating, setIsUpdating] = React.useState(false)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
    const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000 // 5 minutos em milissegundos

    // Função para solicitar permissão
    const requestLocationPermission = async (): Promise<boolean> => {
        const permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        const result = await check(permission)

        if (result === RESULTS.DENIED) {
            const requestResult = await request(permission)
            return requestResult === RESULTS.GRANTED
        }
        return result === RESULTS.GRANTED
    }

    // Função para atualizar a localização do usuário
    const updateUserCoordinates = async (payload: UpdateCoordinatesPayload): Promise<void> => {
        if (session.user.id) {
            try {
                await apiRoutes.account.updateCoordinates({
                    userId: session?.user?.id,
                    coordinates: {
                        latitude: payload.latitude,
                        longitude: payload.longitude,
                    },
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

    // Função para obter e atualizar a localização do usuário
    const useUpdateUserLocation = async () => {
        const hasPermission = await requestLocationPermission()
        if (!hasPermission) throw new Error("Location permission is not granted")

        return new Promise<void>((resolve, reject) => {
            setIsUpdating(true)
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords
                    try {
                        await updateUserCoordinates({ latitude, longitude })
                        setIsUpdating(false)
                        resolve()
                    } catch (error) {
                        setIsUpdating(false)
                        reject(error)
                    }
                },
                (error: GeoError) => {
                    setIsUpdating(false)
                    console.error("Error getting location:", error)
                    reject(error)
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            )
        })
    }

    const updateUserLocation = async (): Promise<void> => {
        if (!session.user.id) {
            throw new Error("User ID is not available")
        }
        useUpdateUserLocation()
    }

    // Inicia o intervalo para atualização a cada 5 minutos
    const startLocationUpdateInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
            console.log(
                `⏰ Executando atualização periódica de localização (intervalo de ${LOCATION_UPDATE_INTERVAL / 60000} minutos)`
            )
            updateUserLocation().catch((error) => {
                console.error("Error updating location in interval:", error)
            })
        }, LOCATION_UPDATE_INTERVAL)
        console.log(
            `⏱️ Intervalo de atualização de localização iniciado: a cada ${LOCATION_UPDATE_INTERVAL / 60000} minutos`
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

    // Verifica se o usuário está logado e inicia o processo
    React.useEffect(() => {
        const checkUserAndStartUpdating = async () => {
            // Verifica se temos dados do usuário na memória
            if (session.user.id) {
                console.log(
                    `🔄 Iniciando serviço de localização para usuário ID: ${session.user.id}`
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
                    "⚠️ Usuário não encontrado na memória, serviço de localização não iniciado"
                )
            }
        }

        checkUserAndStartUpdating()
    }, [session.user.id]) // Dependência na ID do usuário para reiniciar quando mudar

    const contextValue: GeolocationContextsData = {
        updateUserLocation,
        isUpdating,
    }

    return (
        <GeolocationContext.Provider value={contextValue}>{children}</GeolocationContext.Provider>
    )
}

export default GeolocationContext
