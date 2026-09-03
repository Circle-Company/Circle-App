import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import type { FriendshipRelation } from "@/api/friendship/friendship.types"
import { STALE } from "./index"

/**
 * Recorte mínimo de um usuário — o que basta para desenhar uma linha de lista.
 * Normalizado a partir de `GET /users/:id`, que devolve o perfil completo em
 * formatos ligeiramente diferentes dependendo da rota.
 */
export type UserSummary = {
    id: string
    username: string
    name: string | null
    profilePicture: string
    verified: boolean
    areFriends: boolean
    friendshipStatus: FriendshipRelation
}

export const userKeys = {
    all: ["user"] as const,
    summary: (userId: string) => [...userKeys.all, "summary", userId] as const,
}

export function normalizeUserSummary(payload: any): UserSummary {
    const root = (payload && (payload.user || payload.profile)) || payload || {}
    const interactions = root?.interactions ?? {}

    return {
        id: String(root?.id ?? ""),
        username: String(root?.username ?? ""),
        name: root?.name ? String(root.name) : null,
        profilePicture: String(root?.profilePicture ?? root?.profilePictureUrl ?? ""),
        verified: !!root?.status?.verified,
        areFriends: !!interactions?.areFriends,
        friendshipStatus: (interactions?.friendshipStatus ?? "none") as FriendshipRelation,
    }
}

/**
 * Resolve os dados de exibição de um usuário a partir do id. Cada linha da
 * caixa de convites chama isto; como a FlatList só monta as linhas visíveis, o
 * número de requests fica limitado ao que está na tela e o cache cobre o resto.
 */
export function useUserSummaryQuery(
    userId: string,
    options?: { enabled?: boolean; staleTime?: number; placeholderData?: UserSummary },
): UseQueryResult<UserSummary, Error> {
    return useQuery({
        queryKey: userKeys.summary(userId),
        queryFn: async () => normalizeUserSummary(await apiRoutes.user.getById({ userId })),
        enabled: (options?.enabled ?? true) && !!userId,
        staleTime: options?.staleTime ?? STALE.MINUTES.FIVE,
        placeholderData: options?.placeholderData,
    })
}
