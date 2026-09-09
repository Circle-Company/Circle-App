import { createBlobStorage } from "../blob"
import { asNumber } from "../coerce"
import { storageKeys } from "@/store"
import type { MetricsDataType } from "../types"

/**
 * A fronteira com o MMKV. Nada aqui conhece a store — mesma divisão do `../account`.
 *
 * Uma chave só (§2.2/P2): as métricas são lidas juntas e reescritas juntas, porque vêm
 * todas do mesmo payload do backend. O modelo anterior tinha sete chaves, sete leituras no
 * construtor do store e sete escritas por sincronização, sem que nenhuma pudesse mudar
 * sozinha.
 */

export const METRICS_KEY = `${storageKeys().baseKey}metrics` as const
export const METRICS_SCHEMA_VERSION = 1

/** O estado de "sem métricas". Função, e não constante — ver a nota em `../blob.ts`. */
export const emptyState = (): MetricsDataType => ({
    totalMoments: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    totalLikesReceived: 0,
    totalViewsReceived: 0,
    followerGrowthRate30d: 0,
    engagementGrowthRate30d: 0,
    interactionsGrowthRate30d: 0,
})

/**
 * Normaliza um payload vindo do backend ou do disco. Métrica ausente vira `0`, e não
 * `undefined`: a UI soma e formata esses números, e um `undefined` atravessaria como
 * "NaN seguidores".
 */
export const normalize = (value: Partial<MetricsDataType> | undefined): MetricsDataType => ({
    totalMoments: asNumber(value?.totalMoments),
    totalFollowers: asNumber(value?.totalFollowers),
    totalFollowing: asNumber(value?.totalFollowing),
    totalLikesReceived: asNumber(value?.totalLikesReceived),
    totalViewsReceived: asNumber(value?.totalViewsReceived),
    followerGrowthRate30d: asNumber(value?.followerGrowthRate30d),
    engagementGrowthRate30d: asNumber(value?.engagementGrowthRate30d),
    interactionsGrowthRate30d: asNumber(value?.interactionsGrowthRate30d),
})

/** O ciclo (ler/gravar/apagar, sem lançar) vem de `../blob`; o que é próprio das métricas
 * é só o `parse` — tolerante, porque uma métrica nova no backend não pode invalidar as
 * outras. */
export const metricsStorage = createBlobStorage<MetricsDataType>({
    key: METRICS_KEY,
    schemaVersion: METRICS_SCHEMA_VERSION,
    empty: emptyState,
    parse: (data) => normalize(data as Partial<MetricsDataType>),
})
