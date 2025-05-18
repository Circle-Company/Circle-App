import React from "react"
import api from "../services/Api"
import GeolocationContext from "./geolocation"
import PersistedContext from "./Persisted"
import { UserDataType } from "./Persisted/types"

// Types
type ModifiedProfilePicture = Omit<UserDataType["profile_picture"], "small_resolution">

export interface NearUserData extends Omit<UserDataType, "profile_picture"> {
    profile_picture: ModifiedProfilePicture
    distance_km?: number
    you_follow?: boolean
    follow_you?: boolean
}

interface NearbyUsersResponse {
    data: NearUserData[]
    search_params: {
        latitude: number
        longitude: number
        radius_km: number
    }
}

type NearProviderProps = { children: React.ReactNode }

export type NearContextData = {
    nearbyUsers: NearUserData[]
    loading: boolean
    error: string | null
    radius: number
    getNearbyUsers: () => Promise<void>
    setRadius: React.Dispatch<React.SetStateAction<number>>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

// Context
const NearContext = React.createContext<NearContextData>({} as NearContextData)

// Provider
export function Provider({ children }: NearProviderProps) {
    // Contexts
    const { session } = React.useContext(PersistedContext)
    const { isUpdating } = React.useContext(GeolocationContext)

    // States
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [nearbyUsers, setNearbyUsers] = React.useState<NearUserData[]>([])
    const [radius, setRadius] = React.useState(5)
    const [lastCoordinates, setLastCoordinates] = React.useState<{
        latitude: number | null
        longitude: number | null
    }>({
        latitude: null,
        longitude: null,
    })

    // Handlers
    const getNearbyUsers = React.useCallback(async () => {
        if (loading) return

        const currentCoords = {
            latitude: session.account.coordinates?.latitude,
            longitude: session.account.coordinates?.longitude,
        }

        if (!currentCoords.latitude || !currentCoords.longitude) {
            console.log("📍 Coordenadas não disponíveis")
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await api.post<NearbyUsersResponse>("/near/users/find", {
                radius,
                latitude: currentCoords.latitude,
                longitude: currentCoords.longitude,
            }, {
                headers: { Authorization: session.account.jwtToken }
            })

            setNearbyUsers(response.data.data)
            setLastCoordinates(currentCoords)
        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || "Erro ao buscar usuários próximos")
            console.error("Erro ao buscar usuários próximos:", error)
        } finally {
            setLoading(false)
        }
    }, [
        session.account.coordinates?.latitude,
        session.account.coordinates?.longitude,
        session.account.jwtToken,
        radius,
        loading
    ])

    // Effects
    React.useEffect(() => {
        const initializeNearUsers = async () => {
            const hasCoordinates = session.account.coordinates?.latitude && 
                                 session.account.coordinates?.longitude

            if (hasCoordinates) {
                await getNearbyUsers()
            } else {
                const timer = setTimeout(() => {
                    if (session.account.coordinates?.latitude && 
                        session.account.coordinates?.longitude) {
                        getNearbyUsers()
                    }
                }, 5000)
                return () => clearTimeout(timer)
            }
        }
        initializeNearUsers()
    }, [getNearbyUsers, session.account.coordinates?.latitude, session.account.coordinates?.longitude])

    React.useEffect(() => {
        const { latitude, longitude } = session.account.coordinates || {}
        const hasNewCoordinates = latitude && longitude && 
            (latitude !== lastCoordinates.latitude || longitude !== lastCoordinates.longitude)

        if (hasNewCoordinates) {
            getNearbyUsers()
        }
    }, [
        session.account.coordinates,
        radius,
        isUpdating,
        getNearbyUsers,
        lastCoordinates.latitude,
        lastCoordinates.longitude
    ])

    // Context Value
    const contextValue: NearContextData = {
        nearbyUsers,
        loading,
        error,
        radius,
        getNearbyUsers,
        setRadius,
        setLoading,
    }

    return <NearContext.Provider value={contextValue}>{children}</NearContext.Provider>
}

export default NearContext
