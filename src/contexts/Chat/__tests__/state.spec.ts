import { describe, expect, it } from "vitest"

import {
    TYPING_TTL_MS,
    activityInConversation,
    applyPresence,
    applyPresences,
    clearConversationIn,
    isOnlineIn,
    isTypingInConversation,
    pruneExpired,
    startActivityIn,
    startPlayingState,
    stopActivityIn,
    withProgress,
    type ActivityMap,
    type PresenceMap,
} from "../state"

const NOW = Date.parse("2026-09-09T12:00:00.000Z")
const CID = "messaging:abc"
const OTHER = "messaging:xyz"

describe("presença", () => {
    it("registra e consulta", () => {
        const map = applyPresence({}, "u1", { online: true })

        expect(isOnlineIn(map, "u1")).toBe(true)
        expect(isOnlineIn(map, "u2")).toBe(false)
    })

    // O servidor reenvia presença o tempo todo; sem a saída antecipada cada reenvio idêntico
    // renderizaria a grade inteira sem nada ter mudado.
    it("presença idêntica devolve o mesmo objeto", () => {
        const first: PresenceMap = applyPresence({}, "u1", { online: true, lastActiveAt: "x" })
        const second = applyPresence(first, "u1", { online: true, lastActiveAt: "x" })

        expect(second).toBe(first)
    })

    it("qualquer campo diferente cria estado novo", () => {
        const first = applyPresence({}, "u1", { online: true })

        expect(applyPresence(first, "u1", { online: false })).not.toBe(first)
        expect(applyPresence(first, "u1", { online: true, lastActiveAt: "agora" })).not.toBe(first)
    })

    it("lote aplica só o que mudou", () => {
        const first = applyPresence({}, "u1", { online: true })

        expect(applyPresences(first, { u1: { online: true } })).toBe(first)

        const next = applyPresences(first, { u1: { online: true }, u2: { online: false } })
        expect(next).not.toBe(first)
        expect(isOnlineIn(next, "u2")).toBe(false)
    })
})

describe("digitando e gravando", () => {
    const typing = (map: ActivityMap, cid: string, userId: string, now = NOW) =>
        startActivityIn(map, cid, userId, "typing", now)

    it("marca e desmarca", () => {
        let map = typing({}, CID, "u1")
        expect(isTypingInConversation(map, CID, NOW)).toBe(true)

        map = stopActivityIn(map, CID, "u1")
        expect(isTypingInConversation(map, CID, NOW)).toBe(false)
    })

    it("desmarcar quem não está marcado devolve o mesmo objeto", () => {
        const map = typing({}, CID, "u1")
        expect(stopActivityIn(map, CID, "u2")).toBe(map)
    })

    // Em grupo mais de uma pessoa digita ao mesmo tempo — daí devolver lista.
    it("acumula várias pessoas na mesma conversa", () => {
        let map = typing({}, CID, "u1")
        map = typing(map, CID, "u2")

        expect(
            activityInConversation(map, CID, NOW)
                .map((entry) => entry.userId)
                .sort(),
        ).toEqual(["u1", "u2"])
    })

    it("a mesma pessoa em duas conversas não se confunde", () => {
        let map = typing({}, CID, "u1")
        map = typing(map, OTHER, "u1")
        map = stopActivityIn(map, CID, "u1")

        expect(isTypingInConversation(map, CID, NOW)).toBe(false)
        expect(isTypingInConversation(map, OTHER, NOW)).toBe(true)
    })

    it("gravar é atividade distinta de digitar", () => {
        const map = startActivityIn({}, CID, "u1", "recording", NOW)

        expect(isTypingInConversation(map, CID, NOW)).toBe(false)
        expect(activityInConversation(map, CID, NOW)[0].activity).toBe("recording")
    })

    /**
     * O caso que motiva o prazo: o `typing.stop` se perde quando a rede cai, e sem expiração
     * a conversa fica com "digitando…" para sempre.
     */
    it("o aviso expira sozinho sem renovação", () => {
        const map = typing({}, CID, "u1")

        expect(isTypingInConversation(map, CID, NOW + TYPING_TTL_MS - 1)).toBe(true)
        expect(isTypingInConversation(map, CID, NOW + TYPING_TTL_MS + 1)).toBe(false)
    })

    it("um aviso novo renova o prazo", () => {
        let map = typing({}, CID, "u1")
        map = typing(map, CID, "u1", NOW + TYPING_TTL_MS * 0.6)

        expect(isTypingInConversation(map, CID, NOW + TYPING_TTL_MS * 1.2)).toBe(true)
    })

    it("a varredura remove só os vencidos", () => {
        let map = typing({}, CID, "u1")
        map = typing(map, CID, "u2", NOW + TYPING_TTL_MS * 0.9)

        const pruned = pruneExpired(map, NOW + TYPING_TTL_MS + 1)

        expect(Object.keys(pruned)).toHaveLength(1)
        expect(activityInConversation(pruned, CID, NOW + TYPING_TTL_MS + 1)[0].userId).toBe("u2")
    })

    it("varredura sem vencidos devolve o mesmo objeto", () => {
        const map = typing({}, CID, "u1")
        expect(pruneExpired(map, NOW)).toBe(map)
    })

    it("limpar a conversa remove só os avisos dela", () => {
        let map = typing({}, CID, "u1")
        map = typing(map, OTHER, "u2")
        map = clearConversationIn(map, CID)

        expect(activityInConversation(map, CID, NOW)).toEqual([])
        expect(isTypingInConversation(map, OTHER, NOW)).toBe(true)
    })

    it("limpar conversa sem avisos devolve o mesmo objeto", () => {
        const map = typing({}, CID, "u1")
        expect(clearConversationIn(map, OTHER)).toBe(map)
    })

    // `cid` contém `:`, e a chave é `cid:userId` — o prefixo não pode pegar conversa vizinha.
    it("o prefixo não confunde conversas de nome parecido", () => {
        let map = typing({}, "messaging:abc", "u1")
        map = typing(map, "messaging:abcd", "u2")

        expect(activityInConversation(map, "messaging:abc", NOW)).toHaveLength(1)
    })
})

describe("nota de voz", () => {
    it("começa zerada", () => {
        expect(startPlayingState(CID, "m1")).toEqual({ cid: CID, messageId: "m1", progress: 0 })
    })

    it("progresso atualiza", () => {
        const state = withProgress(startPlayingState(CID, "m1"), 0.42)
        expect(state).toMatchObject({ messageId: "m1", progress: 0.42 })
    })

    it("mesmo progresso devolve o mesmo objeto", () => {
        const first = startPlayingState(CID, "m1")
        expect(withProgress(first, 0)).toBe(first)
    })

    it("progresso sem nada tocando não cria estado", () => {
        expect(withProgress(null, 0.5)).toBeNull()
    })
})
