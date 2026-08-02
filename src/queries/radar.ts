import { useQuery } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import { RadarResponse } from "@/api/radar/radar.types"
import { STALE } from "./index"

export const radarKeys = {
    all: ["radar"] as const,
    nearby: (lat: number, lng: number) =>
        [...radarKeys.all, "nearby", lat.toFixed(4), lng.toFixed(4)] as const,
}

type UseRadarQueryOptions = {
    latitude?: number | null
    longitude?: number | null
    enabled?: boolean
}

export function useRadarQuery({ latitude, longitude, enabled = true }: UseRadarQueryOptions) {
    const hasCoords = typeof latitude === "number" && typeof longitude === "number"
    return useQuery<RadarResponse>({
        queryKey: hasCoords ? radarKeys.nearby(latitude!, longitude!) : radarKeys.all,
        queryFn: () => apiRoutes.radar.get({ latitude: latitude!, longitude: longitude! }),
        enabled: enabled && hasCoords,
        staleTime: STALE.SECONDS.THIRTY,
        refetchOnWindowFocus: false,
    })
}
