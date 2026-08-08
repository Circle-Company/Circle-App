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
