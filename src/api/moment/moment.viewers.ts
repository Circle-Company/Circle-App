import api from "@/api"
import type { getViewersParams, MomentViewersResponse } from "./moment.types"

/** Teto do backend: pedir mais que isso não devolve mais que isso. */
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 30

/**
 * `GET /moments/:id/viewers` — quem viu o moment, formato da lista de
 * visualizadores de stories do Instagram.
 *
 * **Somente o dono do moment**: qualquer outro usuário recebe 403. A UI só deve
 * chamar isto a partir de um moment da própria conta.
 *
 * Ordem: visualização mais recente primeiro. O dono nunca entra na lista nem
 * nos números — por isso `total` e `stats.uniqueViewers` batem.
 */
export async function getViewers({
    momentId,
    limit = DEFAULT_LIMIT,
    offset = 0,
}: getViewersParams): Promise<MomentViewersResponse> {
    const safeLimit = Math.min(Math.max(1, Math.round(limit)), MAX_LIMIT)
    const safeOffset = Math.max(0, Math.round(offset))

    const response = await api.get(
        `/moments/${momentId}/viewers?limit=${safeLimit}&offset=${safeOffset}`,
    )
    const data = (response as any)?.data ?? {}

    // Lista vazia é resposta normal (moment recém-publicado), então normalizamos
    // para arrays/números em vez de deixar `undefined` vazar para a tela.
    return {
        success: data.success !== false,
        viewers: Array.isArray(data.viewers) ? data.viewers : [],
        total: typeof data.total === "number" ? data.total : 0,
        stats: {
            totalViews: data.stats?.totalViews ?? 0,
            uniqueViewers: data.stats?.uniqueViewers ?? 0,
            completedViews: data.stats?.completedViews ?? 0,
            averageWatchSeconds: data.stats?.averageWatchSeconds ?? null,
            lastViewedAt: data.stats?.lastViewedAt ?? null,
        },
    }
}
