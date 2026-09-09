import type { MetricsDataType } from "../types"

/** O que vai para `@circle:metrics`. */
export type PersistedMetrics = MetricsDataType & {
    schemaVersion: number
}

export interface MetricsState extends MetricsDataType {
    setTotalMoments: (value: number) => void
    setTotalFollowers: (value: number) => void
    setTotalFollowing: (value: number) => void
    setTotalLikesReceived: (value: number) => void
    setTotalViewsReceived: (value: number) => void
    set: (value: MetricsDataType) => void
    /** Lê do storage. Explícito: o store não faz I/O no import (ver `store.ts`). */
    hydrate: () => void
    /** Zera memória **e** storage numa operação. */
    clear: () => void
}
