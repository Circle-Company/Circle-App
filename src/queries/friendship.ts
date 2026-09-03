import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query"
import { apiRoutes } from "@/api"
import type {
    AcceptFriendRequestResponse,
    FriendRequestsDirection,
    FriendRequestsResponse,
    FriendsResponse,
    FriendshipRelation,
    FriendshipStatusResponse,
    SendFriendRequestResponse,
} from "@/api/friendship/friendship.types"
import { STALE } from "./index"

export type {
    Friend,
    FriendRequestInvite,
    FriendRequestOutcome,
    FriendRequestsDirection,
    FriendshipRelation,
} from "@/api/friendship/friendship.types"

export const friendshipKeys = {
    all: ["friendship"] as const,
    status: (userId: string) => [...friendshipKeys.all, "status", userId] as const,
    friends: () => [...friendshipKeys.all, "friends"] as const,
    friendsOf: (userId: string, limit: number, offset: number) =>
        [...friendshipKeys.friends(), userId, { limit, offset }] as const,
    requests: () => [...friendshipKeys.all, "requests"] as const,
    requestsByDirection: (direction: FriendRequestsDirection, limit: number, offset: number) =>
        [...friendshipKeys.requests(), direction, { limit, offset }] as const,
}

// ──────────────────────────────────────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Status da relação com um usuário. É a fonte de verdade do botão de amizade
 * na tela de perfil quando o payload de `GET /users/:id` não está disponível.
 */
export function useFriendshipStatusQuery(
    userId: string,
    options?: { enabled?: boolean; staleTime?: number },
): UseQueryResult<FriendshipStatusResponse, Error> {
    return useQuery({
        queryKey: friendshipKeys.status(userId),
        queryFn: () => apiRoutes.friendship.getFriendshipStatus({ userId }),
        enabled: (options?.enabled ?? true) && !!userId,
        staleTime: options?.staleTime ?? STALE.SECONDS.THIRTY,
    })
}

/** Lista de amigos de um usuário. `total` é a contagem completa, não da página. */
export function useFriendsQuery(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    options?: { enabled?: boolean; staleTime?: number },
): UseQueryResult<FriendsResponse, Error> {
    return useQuery({
        queryKey: friendshipKeys.friendsOf(userId, limit, offset),
        queryFn: () => apiRoutes.friendship.getFriends({ userId, limit, offset }),
        enabled: (options?.enabled ?? true) && !!userId,
        staleTime: options?.staleTime ?? STALE.MINUTES.ONE,
    })
}

/**
 * Caixa de convites do usuário logado. Uma chamada resolve lista **e** badge —
 * `pendingIncomingCount` vem preenchido mesmo com `direction=outgoing`.
 */
export function useFriendRequestsQuery(
    direction: FriendRequestsDirection = "incoming",
    limit: number = 50,
    offset: number = 0,
    options?: { enabled?: boolean; staleTime?: number },
): UseQueryResult<FriendRequestsResponse, Error> {
    return useQuery({
        queryKey: friendshipKeys.requestsByDirection(direction, limit, offset),
        queryFn: () => apiRoutes.friendship.getFriendRequests({ direction, limit, offset }),
        enabled: options?.enabled ?? true,
        staleTime: options?.staleTime ?? STALE.SECONDS.THIRTY,
    })
}

// ──────────────────────────────────────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Invalida tudo que depende da relação com `userId`: o status daquele par, as
 * listas de amigos e a caixa de convites.
 */
function useInvalidateFriendship() {
    const queryClient = useQueryClient()
    return async (userId?: string) => {
        await Promise.all([
            userId
                ? queryClient.invalidateQueries({ queryKey: friendshipKeys.status(userId) })
                : Promise.resolve(),
            queryClient.invalidateQueries({ queryKey: friendshipKeys.friends() }),
            queryClient.invalidateQueries({ queryKey: friendshipKeys.requests() }),
        ])
    }
}

/**
 * Envia o convite. Atenção ao `outcome: "auto_accepted"`: quando o alvo já
 * tinha convidado você, a relação salta direto para `friends` e a UI não deve
 * mostrar "convite enviado".
 */
export function useSendFriendRequestMutation({ userId }: { userId: string }) {
    const invalidate = useInvalidateFriendship()
    const queryClient = useQueryClient()

    return useMutation<SendFriendRequestResponse, any, void>({
        mutationFn: () => apiRoutes.friendship.sendFriendRequest({ userId }),
        onSuccess: async (data) => {
            // Estado otimista derivado da resposta, antes do refetch.
            const relation: FriendshipRelation = data?.areFriends ? "friends" : "pending_outgoing"
            queryClient.setQueryData<FriendshipStatusResponse>(friendshipKeys.status(userId), {
                success: true,
                relation,
                areFriends: !!data?.areFriends,
            })
            await invalidate(userId)
        },
        onError: (err: any) => {
            console.log("[friendship] sendFriendRequest", err?.response?.data ?? err)
        },
    })
}

/** Cancela o convite enviado. 404 quando não há convite pendente seu. */
export function useCancelFriendRequestMutation({ userId }: { userId: string }) {
    const invalidate = useInvalidateFriendship()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => apiRoutes.friendship.cancelFriendRequest({ userId }),
        onSuccess: async () => {
            queryClient.setQueryData<FriendshipStatusResponse>(friendshipKeys.status(userId), {
                success: true,
                relation: "none",
                areFriends: false,
            })
            await invalidate(userId)
        },
        onError: (err: any) => {
            console.log("[friendship] cancelFriendRequest", err?.response?.data ?? err)
        },
    })
}

/** Aceita o convite recebido. `userId` é o de quem enviou. */
export function useAcceptFriendRequestMutation({ userId }: { userId: string }) {
    const invalidate = useInvalidateFriendship()
    const queryClient = useQueryClient()

    return useMutation<AcceptFriendRequestResponse, any, void>({
        mutationFn: () => apiRoutes.friendship.acceptFriendRequest({ userId }),
        onSuccess: async () => {
            queryClient.setQueryData<FriendshipStatusResponse>(friendshipKeys.status(userId), {
                success: true,
                relation: "friends",
                areFriends: true,
            })
            await invalidate(userId)
        },
        onError: (err: any) => {
            console.log("[friendship] acceptFriendRequest", err?.response?.data ?? err)
        },
    })
}

/** Recusa o convite recebido. Silenciosa: quem enviou não é notificado. */
export function useDeclineFriendRequestMutation({ userId }: { userId: string }) {
    const invalidate = useInvalidateFriendship()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => apiRoutes.friendship.declineFriendRequest({ userId }),
        onSuccess: async () => {
            // Para quem recusou a relação volta a `none` (a recusa é silenciosa).
            queryClient.setQueryData<FriendshipStatusResponse>(friendshipKeys.status(userId), {
                success: true,
                relation: "none",
                areFriends: false,
            })
            await invalidate(userId)
        },
        onError: (err: any) => {
            console.log("[friendship] declineFriendRequest", err?.response?.data ?? err)
        },
    })
}

/** Desfaz a amizade. Não notifica ninguém. */
export function useRemoveFriendMutation({ userId }: { userId: string }) {
    const invalidate = useInvalidateFriendship()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => apiRoutes.friendship.removeFriend({ userId }),
        onSuccess: async () => {
            queryClient.setQueryData<FriendshipStatusResponse>(friendshipKeys.status(userId), {
                success: true,
                relation: "none",
                areFriends: false,
            })
            await invalidate(userId)
        },
        onError: (err: any) => {
            console.log("[friendship] removeFriend", err?.response?.data ?? err)
        },
    })
}
