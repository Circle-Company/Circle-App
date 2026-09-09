import { useQuery } from "@tanstack/react-query"

import { apiRoutes } from "@/api"
import { MomentRequestError } from "@/api/moment/moment.get"
import type { MomentDetail } from "@/api/moment/moment.types"
import { STALE } from "@/queries"

export const momentKeys = {
    all: ["moment"] as const,
    detail: (id: string) => [...momentKeys.all, "detail", id] as const,
}

type UseMomentQueryProps = {
    momentId: string
    /**
     * Semente síncrona, vinda de uma lista que já tem o momento em memória. Pinta a tela no
     * primeiro render e é marcada como velha na mesma hora, então a revalidação sai em
     * background com a tela já completa. Quem a monta é `useMomentDetail`.
     */
    seed?: MomentDetail | null
    enabled?: boolean
}

/**
 * `GET /moments/:id` pelo React Query.
 *
 * Duas decisões que não são o default do app e por isso moram aqui:
 *
 * - **`structuralSharing: true`** — o padrão global é `false`. Sem isto toda revalidação
 *   devolveria um objeto novo mesmo com conteúdo idêntico, e o `media` mudando de
 *   referência faz o `MediaRenderVideo` reexibir a thumbnail e reanexar a fonte. O vídeo
 *   pisca a cada refetch.
 * - **retry só no transitório** — o backend responde `400` para "não existe", "sem
 *   permissão" e "erro interno" (§6/§7.4 do contrato). Um retry decidido pelo status
 *   tentaria indefinidamente um momento que nunca vai existir.
 */
export function useMomentQuery({ momentId, seed, enabled = true }: UseMomentQueryProps) {
    return useQuery<MomentDetail, MomentRequestError>({
        queryKey: momentKeys.detail(momentId),
        queryFn: ({ signal }) => apiRoutes.moment.get(momentId, signal),
        enabled: enabled && Boolean(momentId),
        initialData: seed ?? undefined,
        initialDataUpdatedAt: 0,
        staleTime: STALE.MINUTES.ONE,
        structuralSharing: true,
        retry: (failureCount, error) =>
            error instanceof MomentRequestError && error.isRetryable && failureCount < 2,
    })
}
