import { NearUserData } from "../../contexts/near"
import api from "../../services/Api"
import { useMutation } from "@tanstack/react-query"

interface NearbyUsersResponse {
    users: NearUserData[]
    searchParams: {
        center: {
            latitude: string
            longitude: string       
        }
        radius: number
        total: number
        limit: number
    }
}

interface FindNearbyUsersParams {
    latitude: string
    longitude: string
    radius?: number
    limit?: number
    jwtToken: string
}

async function findNearbyUsers({ latitude, longitude, radius, limit, jwtToken }: FindNearbyUsersParams) {
    const response = await api.post<NearbyUsersResponse>("/near/users", {
        latitude,
        longitude,
        radius,
        limit
    }, {
        headers: { Authorization: jwtToken }
    })

    console.log(response.data)
    
    // Adaptar a resposta para o formato esperado pelo contexto
    return {
        data: response.data.users,
        search_params: {
            latitude: response.data.searchParams.center.latitude,
            longitude: response.data.searchParams.center.longitude,
            radius_km: response.data.searchParams.radius
        }
    }
}

export function useFindNearbyUsers() {
    return useMutation({
        mutationFn: findNearbyUsers,
    })
} 