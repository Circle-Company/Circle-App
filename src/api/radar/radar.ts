import api from "@/api"
import { storage, storageKeys } from "@/store"
import { PopularNearbyQuery, PopularNearbyResponse, RadarQuery, RadarResponse } from "./radar.types"

async function getRadar({ latitude, longitude }: RadarQuery): Promise<RadarResponse> {
    const res = await api.get<RadarResponse>("/radar", {
        params: {
            latitude: String(latitude),
            longitude: String(longitude),
        },
        headers: {
            Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
        },
    })
    return res.data
}

/**
 * Lista de pessoas populares por perto, já filtrada pelo backend: quem você não
 * pode mais convidar (amigo ou convite pendente) não vem. Ver docs/popular-nearby.md.
 */
async function getPopularNearby({
    latitude,
    longitude,
    limit,
}: PopularNearbyQuery): Promise<PopularNearbyResponse> {
    const res = await api.get<PopularNearbyResponse>("/radar/popular", {
        params: {
            latitude: String(latitude),
            longitude: String(longitude),
            ...(limit ? { limit: String(limit) } : {}),
        },
        headers: {
            Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
        },
    })
    return res.data
}

export const routes = {
    get: getRadar,
    getPopularNearby,
}
