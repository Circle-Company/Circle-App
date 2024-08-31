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
}

// Contexto
const GeolocationContext = React.createContext<GeolocationContextsData>(
    {} as GeolocationContextsData
)

export function Provider({ children }: GeolocationProviderProps) {
    const { session } = React.useContext(PersistedContext)

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
        try {
            await apiRoutes.account.updateCoordinates({
                userId: session?.user?.id,
                coordinates: {
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                },
            })
        } catch (error) {
            console.error("Error updating coordinates:", error)
            throw error
        }
    }

    // Função para obter e atualizar a localização do usuário
    const useUpdateUserLocation = async () => {
        const hasPermission = await requestLocationPermission()
        if (!hasPermission) throw new Error("Location permission is not granted")
        console.log("hasPermission: ", hasPermission)
        return new Promise<void>((resolve, reject) => {
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords
                    try {
                        await updateUserCoordinates({ latitude, longitude })
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                },
                (error: GeoError) => {
                    console.error("Error getting location:", error)
                    reject(error)
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            )
        })
    }

    const updateUserLocation = async (): Promise<void> => {
        if (!session?.user?.id) {
            throw new Error("User ID is not available")
        }
        useUpdateUserLocation()
    }

    React.useEffect(() => {
        async function getPermission() {
            await useUpdateUserLocation()
        }
        getPermission()
    }, [])

    const contextValue: GeolocationContextsData = {
        updateUserLocation,
    }

    return (
        <GeolocationContext.Provider value={contextValue}>{children}</GeolocationContext.Provider>
    )
}

export default GeolocationContext
