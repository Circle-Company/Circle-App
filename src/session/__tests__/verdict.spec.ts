import { describe, expect, it } from "vitest"

import {
    RefreshTimeoutError,
    backoffDelayMs,
    classifyRefreshError,
    isTerminal,
} from "../verdict"

const httpError = (status: number, headers: Record<string, unknown> = {}) => ({
    response: { status, headers, data: {} },
})

describe("classifyRefreshError — a tabela do §5.6", () => {
    it("401 REFRESH_TOKEN_INVALID é terminal", () => {
        expect(classifyRefreshError(httpError(401))).toEqual({
            kind: "terminal",
            reason: "REFRESH_TOKEN_INVALID",
            status: 401,
        })
    })

    it("403 ACCOUNT_BLOCKED é terminal", () => {
        expect(classifyRefreshError(httpError(403))).toMatchObject({
            kind: "terminal",
            reason: "ACCOUNT_BLOCKED",
        })
    })

    it("400 é terminal — bug do cliente, não há o que renovar", () => {
        expect(classifyRefreshError(httpError(400))).toMatchObject({
            kind: "terminal",
            reason: "BAD_REQUEST",
        })
    })

    // O ponto que o contrato do backend faz questão de deixar claro.
    it("500 é transitório: a credencial pode continuar válida", () => {
        expect(classifyRefreshError(httpError(500))).toMatchObject({
            kind: "transient",
            status: 500,
        })
    })

    it("502/503/504 são transitórios", () => {
        for (const status of [502, 503, 504]) {
            expect(classifyRefreshError(httpError(status))).toMatchObject({ kind: "transient" })
        }
    })

    it("429 é transitório e respeita Retry-After em segundos", () => {
        const verdict = classifyRefreshError(httpError(429, { "retry-after": "120" }))

        expect(verdict).toMatchObject({ kind: "transient", reason: "RATE_LIMITED" })
        expect((verdict as any).retryAfterMs).toBe(120_000)
    })

    it("429 aceita Retry-After como data HTTP", () => {
        const future = new Date(Date.now() + 60_000).toUTCString()
        const verdict = classifyRefreshError(httpError(429, { "retry-after": future }))

        expect((verdict as any).retryAfterMs).toBeGreaterThan(50_000)
    })

    it("429 sem Retry-After legível continua transitório, só sem sugestão de espera", () => {
        const verdict = classifyRefreshError(httpError(429, { "retry-after": "logo ali" }))

        expect(verdict).toMatchObject({ kind: "transient" })
        expect((verdict as any).retryAfterMs).toBeUndefined()
    })

    it("erro sem resposta HTTP (rede/DNS/offline) é transitório", () => {
        expect(classifyRefreshError(new Error("Network Error"))).toMatchObject({
            kind: "transient",
            reason: "Network Error",
        })
        expect(classifyRefreshError(undefined)).toMatchObject({ kind: "transient" })
    })

    // A categoria que existe por causa do §0.1c: não sabemos se o servidor rotacionou.
    it("timeout local é DESCONHECIDO — nunca terminal, nunca transitório", () => {
        const verdict = classifyRefreshError(new RefreshTimeoutError(30_000))

        expect(verdict.kind).toBe("unknown")
        expect(isTerminal(verdict)).toBe(false)
    })

    it("só o veredito terminal desloga", () => {
        expect(isTerminal(classifyRefreshError(httpError(401)))).toBe(true)
        expect(isTerminal(classifyRefreshError(httpError(500)))).toBe(false)
        expect(isTerminal(classifyRefreshError(new Error("offline")))).toBe(false)
        expect(isTerminal(classifyRefreshError(new RefreshTimeoutError(1)))).toBe(false)
    })
})

describe("backoffDelayMs", () => {
    it("cresce a cada tentativa", () => {
        const noJitter = () => 1 // 100% do passo
        const delays = [0, 1, 2, 3].map((attempt) => backoffDelayMs(attempt, noJitter))

        expect(delays).toEqual([1_000, 2_000, 4_000, 8_000])
    })

    it("satura no último passo em vez de crescer sem limite", () => {
        const noJitter = () => 1

        expect(backoffDelayMs(10, noJitter)).toBe(8_000)
        expect(backoffDelayMs(100, noJitter)).toBe(8_000)
    })

    // Sem jitter, todos os devices que perderam a rede voltam no mesmo instante.
    it("aplica jitter entre 50% e 100% do passo", () => {
        expect(backoffDelayMs(0, () => 0)).toBe(500)
        expect(backoffDelayMs(0, () => 1)).toBe(1_000)
        expect(backoffDelayMs(0, () => 0.5)).toBe(750)
    })
})
