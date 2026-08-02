import api from "@/api"
import { storage, storageKeys } from "@/store"
import { RadarQuery, RadarResponse } from "./radar.types"

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

export const routes = {
    get: getRadar,
}
