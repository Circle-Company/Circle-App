export type RadarQuery = {
    latitude: number
    longitude: number
}

export type RadarPrecision = "exact" | "approximate"

export type RadarScope = "res9" | "res9+neighbors" | "res8+neighbors"

export type RadarPerson = {
    userId: string
    distanceMeters: number
    bearingDegrees: number
    freshnessMs: number
    precision: RadarPrecision
}

export type RadarOrigin = {
    hexId: string
    resolution: number
}

export type RadarResponse = {
    success: boolean
    origin: RadarOrigin
    scope: RadarScope
    people: RadarPerson[]
    generatedAt: number
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /radar/popular — "populares na sua região"
// Contrato em docs/popular-nearby.md
// ──────────────────────────────────────────────────────────────────────────────

export type PopularNearbyQuery = {
    latitude: number
    longitude: number
    /** Teto de 50 no backend; valores fora da faixa são ajustados, não dão erro. */
    limit?: number
}

export type PopularPerson = {
    userId: string
    username: string | null
    name: string | null
    profilePictureUrl: string | null
    distanceMeters: number
    /**
     * Piso da faixa de amigos (5, 10, 25, 50, 100, 250, 500, 1000). O backend
     * nunca devolve a contagem exata. `null` = pessoa sem faixa, e nesse caso a
     * UI omite a linha de texto.
     */
    friendsCountBucket: number | null
    /** Texto pronto, sempre em inglês. Preferir montar a partir do bucket. */
    friendsLabel: string | null
}

export type PopularNearbyResponse = {
    success: boolean
    origin: RadarOrigin
    scope: RadarScope
    people: PopularPerson[]
    generatedAt: number
}
