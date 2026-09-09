import { create } from "zustand"

import { asNumber } from "../coerce"
import type { MetricsDataType } from "../types"
import { emptyState, metricsStorage, normalize } from "./metrics.persistence"
import type { MetricsState } from "./metrics.types"

/**
 * As métricas do usuário logado — seguidores, likes e visualizações recebidas.
 *
 * Escopo **usuário** (`../scopes`): somem no logout e na troca de conta. São dado derivado,
 * vindo inteiro do backend a cada sincronização, e por isso o `clear()` não precisa
 * preservar nada.
 *
 * A divisão em arquivos é a mesma dos outros dois stores:
 *
 *   types.ts        a forma em memória e a forma em disco
 *   persistence.ts  chave, padrões e tudo que toca o storage
 *   index.ts        a store Zustand e as ações
 */

/**
 * Os setters individuais existem para atualização otimista na UI (um follow novo aparece
 * antes de o servidor confirmar). Cada um reescreve o blob inteiro, e isso é de propósito:
 * é **uma** escrita de poucas centenas de bytes, contra manter sete chaves que divergem.
 */
export const useMetricsStore = create<MetricsState>((set, get) => {
    /** Aplica um campo e persiste o conjunto — o padrão de todo setter abaixo. */
    const patch = (partial: Partial<MetricsDataType>) => {
        set(partial)
        metricsStorage.write(normalize(get()))
    }

    return {
        // Sem I/O no import: hidratar é decisão do provider, não efeito colateral de
        // carregar o módulo.
        ...emptyState(),

        setTotalMoments: (value) => patch({ totalMoments: asNumber(value) }),
        setTotalFollowers: (value) => patch({ totalFollowers: asNumber(value) }),
        setTotalFollowing: (value) => patch({ totalFollowing: asNumber(value) }),
        setTotalLikesReceived: (value) => patch({ totalLikesReceived: asNumber(value) }),
        setTotalViewsReceived: (value) => patch({ totalViewsReceived: asNumber(value) }),

        set: (value: MetricsDataType) => {
            const next = normalize(value)
            set(next)
            metricsStorage.write(next)
        },

        hydrate: () => set(metricsStorage.read()),

        clear: () => {
            metricsStorage.clear()
            set(emptyState())
        },
    }
})

export { METRICS_KEY, METRICS_SCHEMA_VERSION } from "./metrics.persistence"
export type { MetricsState, PersistedMetrics } from "./metrics.types"
