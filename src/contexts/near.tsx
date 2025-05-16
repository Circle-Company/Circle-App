import React from "react"
import api from "../services/Api"
import PersistedContext from "./Persisted"
import GeolocationContext from "./geolocation"
import { UserDataType } from "./Persisted/types"
import mockNearbyUsers from "../mock-data/near_users.json"

type ModifiedProfilePicture = Omit<UserDataType["profile_picture"], "small_resolution">

export interface NearUserData extends Omit<UserDataType, "profile_picture"> {
    profile_picture: ModifiedProfilePicture
    distance_km?: number
    you_follow?: boolean
    follow_you?: boolean
}

interface PaginationData {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
}

interface SearchParams {
    latitude: number
    longitude: number
    radius_km: number
}

interface NearbyUsersResponse {
    data: NearUserData[]
    pagination: PaginationData
    search_params: SearchParams
}

type NearProviderProps = { children: React.ReactNode }

export type NearContextData = {
    nearbyUsers: NearUserData[]
    loading: boolean
    refreshing: boolean
    error: string | null
    radius: number
    pagination: PaginationData | null
    hasMorePages: boolean
    getNearbyUsers: (page?: number) => Promise<void>
    refreshNearbyUsers: () => Promise<void>
    loadMoreUsers: () => Promise<void>
    setRadius: React.Dispatch<React.SetStateAction<number>>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setRefreshing: React.Dispatch<React.SetStateAction<boolean>>
}

const NearContext = React.createContext<NearContextData>({} as NearContextData)

export function Provider({ children }: NearProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const { isUpdating } = React.useContext(GeolocationContext)
    const [loading, setLoading] = React.useState(false)
    const [loadingMore, setLoadingMore] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [nearbyUsers, setNearbyUsers] = React.useState<NearUserData[]>(
        mockNearbyUsers as NearUserData[]
    )
    const [pagination, setPagination] = React.useState<PaginationData | null>({
        totalItems: mockNearbyUsers.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: mockNearbyUsers.length,
    })
    const [radius, setRadius] = React.useState(5) // raio em quilômetros (default 5km)
    const [lastCoordinates, setLastCoordinates] = React.useState<{
        latitude: number | null
        longitude: number | null
    }>({
        latitude: null,
        longitude: null,
    })

    React.useEffect(() => {
        setNearbyUsers(mockNearbyUsers as NearUserData[])
    }, [])

    // Computar se há mais páginas disponíveis
    const hasMorePages = React.useMemo(() => {
        if (!pagination) return false
        return pagination.currentPage < pagination.totalPages
    }, [pagination])

    async function getNearbyUsers(page: number = 1) {
        return
        if (loading && page === 1) return
        if (loadingMore && page > 1) return

        const currentCoords = {
            latitude: session.account.coordinates?.latitude,
            longitude: session.account.coordinates?.longitude,
        }

        // Verifica se as coordenadas existem
        if (!currentCoords.latitude || !currentCoords.longitude) {
            console.log("📍 Coordenadas não disponíveis, não é possível buscar usuários próximos")
            return
        }

        try {
            if (page === 1) {
                setLoading(true)
            } else {
                setLoadingMore(true)
            }
            setError(null)

            console.log(`🔍 Buscando usuários próximos: página ${page}, raio ${radius}km`)
            console.log(
                `📍 Usando coordenadas: Lat ${currentCoords.latitude}, Long ${currentCoords.longitude}`
            )

            const response = await api.post<NearbyUsersResponse>(
                "/near/users/find",
                {
                    radius,
                    latitude: currentCoords.latitude,
                    longitude: currentCoords.longitude,
                },
                {
                    headers: {
                        Authorization: session.account.jwtToken,
                    },
                    params: {
                        page,
                        limit: 10, // Tamanho fixo de página
                    },
                }
            )

            // Processar a resposta
            const { data, pagination: paginationData, search_params } = response.data

            setPagination(paginationData)
            console.log(
                `✅ Encontrados ${data.length} usuários próximos (página ${paginationData.currentPage}/${paginationData.totalPages})`
            )

            // Atualiza as últimas coordenadas utilizadas
            setLastCoordinates(currentCoords)
        } catch (err: any) {
            setError(err.message || "Erro ao buscar usuários próximos")
            console.error("Erro ao buscar usuários próximos:", err)
        } finally {
            if (page === 1) {
                setLoading(false)
            } else {
                setLoadingMore(false)
            }
        }
    }

    async function refreshNearbyUsers() {
        if (refreshing) return

        try {
            setRefreshing(true)
            setError(null)
            console.log("🔄 Atualizando lista de usuários próximos")

            // Sempre busca a primeira página ao fazer refresh
            await getNearbyUsers(1)
        } catch (err: any) {
            setError(err.message || "Erro ao atualizar usuários próximos")
            console.error("Erro ao atualizar usuários próximos:", err)
        } finally {
            setRefreshing(false)
        }
    }

    async function loadMoreUsers() {
        if (!pagination || loadingMore || loading) return
        if (pagination.currentPage >= pagination.totalPages) return

        const nextPage = pagination.currentPage + 1
        console.log(`📄 Carregando mais usuários (página ${nextPage})`)
        await getNearbyUsers(nextPage)
    }

    // Buscar usuários ao iniciar o app
    React.useEffect(() => {
        const initializeNearUsers = async () => {
            if (session.account.coordinates?.latitude && session.account.coordinates?.longitude) {
                console.log("🚀 Inicializando busca de usuários próximos ao iniciar o app")
                await getNearbyUsers(1)
            } else {
                console.log("⏳ Aguardando coordenadas para buscar usuários próximos")
                const timer = setTimeout(() => {
                    if (
                        session.account.coordinates?.latitude &&
                        session.account.coordinates?.longitude
                    ) {
                        console.log("⏰ Verificando coordenadas após delay inicial")
                        getNearbyUsers(1)
                    }
                }, 5000)

                return () => clearTimeout(timer)
            }
        }

        initializeNearUsers()
    }, [])

    // Carregar usuários próximos quando as coordenadas mudarem
    React.useEffect(() => {
        const latitude = session.account.coordinates?.latitude
        const longitude = session.account.coordinates?.longitude

        if (latitude && longitude) {
            if (latitude !== lastCoordinates.latitude || longitude !== lastCoordinates.longitude) {
                console.log("📍 Coordenadas atualizadas, buscando novos usuários próximos")
                getNearbyUsers(1) // Reinicia na página 1 quando as coordenadas mudam
            }
        }
    }, [
        session.account.coordinates?.latitude,
        session.account.coordinates?.longitude,
        radius,
        isUpdating,
    ])

    const contextValue: NearContextData = {
        nearbyUsers,
        loading,
        refreshing,
        error,
        radius,
        pagination,
        hasMorePages,
        getNearbyUsers,
        refreshNearbyUsers,
        loadMoreUsers,
        setRadius,
        setLoading,
        setRefreshing,
    }

    return <NearContext.Provider value={contextValue}>{children}</NearContext.Provider>
}

export default NearContext
