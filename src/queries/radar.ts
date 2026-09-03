import { useQuery } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import { PopularNearbyResponse, RadarResponse } from "@/api/radar/radar.types"
import { STALE } from "./index"

export const radarKeys = {
    all: ["radar"] as const,
    nearby: (lat: number, lng: number) =>
        [...radarKeys.all, "nearby", lat.toFixed(4), lng.toFixed(4)] as const,
    popular: (lat: number, lng: number, limit: number) =>
        [...radarKeys.all, "popular", lat.toFixed(4), lng.toFixed(4), limit] as const,
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

type UsePopularNearbyQueryOptions = UseRadarQueryOptions & {
    /** Padrão 20, teto 50 no backend. */
    limit?: number
}

/**
 * Lista de "populares na sua região". A presença tem janela de 2 minutos no
 * backend, então a lista é volátil por natureza — o `staleTime` curto reflete
 * isso, mas sem polling: quem recarrega é o usuário (pull-to-refresh) ou a
 * volta para a tela.
 */
export function usePopularNearbyQuery({
    latitude,
    longitude,
    limit = 20,
    enabled = true,
}: UsePopularNearbyQueryOptions) {
    const hasCoords = typeof latitude === "number" && typeof longitude === "number"
    return useQuery<PopularNearbyResponse>({
        queryKey: hasCoords
            ? radarKeys.popular(latitude!, longitude!, limit)
            : [...radarKeys.all, "popular"],
        queryFn: () =>
            apiRoutes.radar.getPopularNearby({
                latitude: latitude!,
                longitude: longitude!,
                limit,
            }),
        enabled: enabled && hasCoords,
        staleTime: STALE.SECONDS.THIRTY,
        refetchOnWindowFocus: false,
    })
}
