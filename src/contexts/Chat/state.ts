/**
 * A lógica de estado do chat, separada do provider.
 *
 * Fica fora do componente porque é a única forma de testá-la neste projeto: renderizar
 * árvore não funciona sob o vitest (ver CLAUDE.md > Testing), então o que precisa de teste
 * precisa ser função pura. O `index.tsx` desta pasta é só a casca de `useState` em volta
 * disto.
 *
 * Todas as funções abaixo devolvem **o mesmo objeto** quando nada muda. Isso não é
 * otimização de estilo: o servidor reenvia presença e digitação a todo momento, e um objeto
 * novo a cada reenvio idêntico renderizaria a grade inteira sem nada ter mudado.
 */

/** Quanto tempo um "está digitando" continua valendo sem novo aviso.
 *
 * O Stream emite `typing.start` e `typing.stop`, mas o `stop` se perde quando a rede cai ou
 * o app do outro lado morre — e aí a conversa fica com "digitando…" para sempre. O prazo é a
 * rede de segurança: sem renovação, o estado expira sozinho. */
export const TYPING_TTL_MS = 7_000

export type ChatPresence = {
    online: boolean
    /** ISO do último momento em que a pessoa esteve online. */
    lastActiveAt?: string
}

/** O que uma pessoa está fazendo agora numa conversa. */
export type ChatActivity = "typing" | "recording"

export type ActivityEntry = {
    userId: string
    activity: ChatActivity
    /** Quando expira, em ms epoch. Renovado a cada aviso. */
    expiresAt: number
}

export type PresenceMap = Record<string, ChatPresence>
/** Chave: `${cid}:${userId}` — a mesma pessoa pode estar digitando em duas conversas. */
export type ActivityMap = Record<string, ActivityEntry>

export type PlayingState = { cid: string; messageId: string; progress: number } | null

export const activityKey = (cid: string, userId: string) => `${cid}:${userId}`

// ── Presença ───────────────────────────────────────────────────────────────────────────

export function applyPresence(map: PresenceMap, userId: string, next: ChatPresence): PresenceMap {
    const current = map[userId]
    if (current && current.online === next.online && current.lastActiveAt === next.lastActiveAt) {
        return map
    }
    return { ...map, [userId]: next }
}

export function applyPresences(map: PresenceMap, batch: PresenceMap): PresenceMap {
    const changed = Object.entries(batch).filter(([userId, presence]) => {
        const current = map[userId]
        return (
            !current ||
            current.online !== presence.online ||
            current.lastActiveAt !== presence.lastActiveAt
        )
    })
    if (!changed.length) return map
    return { ...map, ...Object.fromEntries(changed) }
}

export const isOnlineIn = (map: PresenceMap, userId: string): boolean =>
    map[userId]?.online === true

// ── Digitando / gravando ───────────────────────────────────────────────────────────────

export function startActivityIn(
    map: ActivityMap,
    cid: string,
    userId: string,
    activity: ChatActivity,
    now: number,
): ActivityMap {
    return {
        ...map,
        [activityKey(cid, userId)]: { userId, activity, expiresAt: now + TYPING_TTL_MS },
    }
}

export function stopActivityIn(map: ActivityMap, cid: string, userId: string): ActivityMap {
    const key = activityKey(cid, userId)
    if (!map[key]) return map
    const next = { ...map }
    delete next[key]
    return next
}

export function clearConversationIn(map: ActivityMap, cid: string): ActivityMap {
    const prefix = `${cid}:`
    const keys = Object.keys(map).filter((key) => key.startsWith(prefix))
    if (!keys.length) return map
    const next = { ...map }
    for (const key of keys) delete next[key]
    return next
}

/** Remove os avisos vencidos. Devolve o mesmo mapa quando nenhum venceu. */
export function pruneExpired(map: ActivityMap, now: number): ActivityMap {
    const alive = Object.entries(map).filter(([, entry]) => entry.expiresAt > now)
    if (alive.length === Object.keys(map).length) return map
    return Object.fromEntries(alive)
}

/**
 * Quem está em atividade numa conversa, já sem os expirados.
 *
 * Devolve lista porque em grupo mais de uma pessoa digita ao mesmo tempo, e a UI costuma
 * dizer "Marina e mais 2 estão digitando".
 */
export function activityInConversation(
    map: ActivityMap,
    cid: string,
    now: number,
): ActivityEntry[] {
    const prefix = `${cid}:`
    return Object.entries(map)
        .filter(([key, entry]) => key.startsWith(prefix) && entry.expiresAt > now)
        .map(([, entry]) => entry)
}

export const isTypingInConversation = (map: ActivityMap, cid: string, now: number): boolean =>
    activityInConversation(map, cid, now).some((entry) => entry.activity === "typing")

// ── Nota de voz ────────────────────────────────────────────────────────────────────────

/** Uma nota de voz por vez no app inteiro: começar outra encerra a anterior, que é o que o
 * usuário espera e o que evita dois áudios sobrepostos. */
export const startPlayingState = (cid: string, messageId: string): PlayingState => ({
    cid,
    messageId,
    progress: 0,
})

export function withProgress(state: PlayingState, progress: number): PlayingState {
    if (!state) return state
    if (state.progress === progress) return state
    return { ...state, progress }
}

// ── Paginação da conversa ──────────────────────────────────────────────────────────────
