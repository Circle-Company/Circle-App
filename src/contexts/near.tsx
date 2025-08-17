import PersistedContext from "./Persisted"
import React from "react"
import { UserDataType } from "./Persisted/types"
import { useFindNearbyUsers } from "../state/queries"

// Types
type ModifiedProfilePicture = Omit<UserDataType["profile_picture"], "small_resolution">

export interface NearUserData extends Omit<UserDataType, "profile_picture"> {
    profile_picture: ModifiedProfilePicture
    distance_km?: number
    you_follow?: boolean
    follow_you?: boolean
}

type NearProviderProps = { children: React.ReactNode }

export type NearContextData = {
    nearbyUsers: NearUserData[]
    getNearbyUsers: () => Promise<void>
    loading: boolean
    error: string | null
    radius: number
    refresh: () => Promise<void>
    setRadius: React.Dispatch<React.SetStateAction<number>>
}

// Context
const NearContext = React.createContext<NearContextData | null>(null)

// Provider
export function Provider({ children }: NearProviderProps) {
    // Contexts
    const { session } = React.useContext(PersistedContext)

    // States
    const [radius, setRadius] = React.useState(100)
    const [nearbyUsers, setNearbyUsers] = React.useState<NearUserData[]>([])
    const [error, setError] = React.useState<string | null>(null)

    // Mutation para buscar usuários próximos
    const findNearbyUsersMutation = useFindNearbyUsers()

    // Memoize as funções para evitar recriações desnecessárias
    const getNearbyUsers = React.useCallback(async () => {
        if (!session?.account?.coordinates) {
            setError("Coordenadas não disponíveis")
            return
        }

        const { latitude, longitude } = session.account.coordinates
        const jwtToken = session.account.jwtToken

        if (!jwtToken) {
            setError("Token não disponível")
            return
        }

        try {
            const result = await findNearbyUsersMutation.mutateAsync({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                radius,
                jwtToken,
            })
            setNearbyUsers(result.data || [])
            setError(null)
        } catch (err: any) {
            setError(err.message || "Erro ao buscar usuários próximos")
            setNearbyUsers([])
        }
    }, [session?.account?.coordinates, session?.account?.jwtToken, radius, findNearbyUsersMutation])

    const refresh = React.useCallback(async () => {
        await getNearbyUsers()
    }, [getNearbyUsers])

    // Memoize o valor do contexto para evitar recriações desnecessárias
    const contextValue = React.useMemo(
        () => ({
            nearbyUsers,
            getNearbyUsers,
            loading: findNearbyUsersMutation.isPending,
            error,
            radius,
            refresh,
            setRadius,
        }),
        [
            nearbyUsers,
            getNearbyUsers,
            findNearbyUsersMutation.isPending,
            error,
            radius,
            refresh,
            setRadius,
        ]
    )

    return <NearContext.Provider value={contextValue}>{children}</NearContext.Provider>
}

// Hook personalizado para usar o contexto
export function useNearContext() {
    const context = React.useContext(NearContext)
    if (!context) {
        throw new Error("useNearContext deve ser usado dentro de um NearProvider")
    }
    return context
}

export default NearContext
