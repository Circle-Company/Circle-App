import { describe, expect, it } from "vitest"

import { Action, OpaqueBundle, State, initialState, reducer } from "../reducer"
import { AccountStatus, Credentials, Identity, ProfileCache } from "../schema"

const identity: Identity = { userId: "user-1", appleUserId: "apple-1" }
const profile: ProfileCache = { username: "fulano", name: "Fulano" }
const status: AccountStatus = {
    accessLevel: "USER",
    verified: true,
    blocked: false,
    deleted: false,
}

const credentialsAt = (generation: number): Credentials => ({
    accessToken: `access-${generation}`,
    refreshToken: `refresh-${generation}`,
    generation,
    issuedAt: "2026-01-01T00:00:00.000Z",
})

const bundleA: OpaqueBundle = { name: "A" }
const bundleB: OpaqueBundle = { name: "B" }

const signIn = (bundle: OpaqueBundle, generation = 0): Action => ({
    type: "signed-in",
    bundle,
    identity,
    credentials: credentialsAt(generation),
    profile,
    status,
})

/** Estado logado com `bundleA` corrente, que é o ponto de partida da maioria dos casos. */
function activeState(): State {
    return reducer(initialState({ schemaVersion: 1, state: "empty" }), signIn(bundleA))
}

describe("estado inicial", () => {
    // O app sobe SEMPRE deslogado e só então promove a sessão (§5.1).
    it("começa com o bundle público, mesmo com sessão ativa em disco", () => {
        const state = initialState({
            schemaVersion: 1,
            state: "active",
            identity,
            credentials: credentialsAt(3),
            profile,
            status,
            meta: { signedInAt: "2026-01-01T00:00:00.000Z" },
        })

        expect(state.currentBundleState.bundle).toBeNull()
        expect(state.session.state).toBe("active")
        expect(state.needsPersist).toBe(false)
    })
})

describe("signed-in / resumed", () => {
    it("promove o bundle e marca para persistir", () => {
        const state = activeState()

        expect(state.session).toMatchObject({ state: "active", identity, profile, status })
        expect(state.currentBundleState).toEqual({ bundle: bundleA, userId: "user-1" })
        expect(state.needsPersist).toBe(true)
    })

    it("um login novo troca o bundle corrente", () => {
        const state = reducer(activeState(), signIn(bundleB, 5))

        expect(state.currentBundleState.bundle).toBe(bundleB)
        expect((state.session as any).credentials.generation).toBe(5)
    })
})

describe("guard de identidade do bundle (§6)", () => {
    // (a) um bundle obsoleto não pode deslogar a conta corrente
    it("evento expired de bundle obsoleto NÃO desloga", () => {
        const state = reducer(activeState(), signIn(bundleB, 1))

        const next = reducer(state, {
            type: "received-session-event",
            bundle: bundleA, // o bundle que já foi substituído
            event: { type: "expired", verdict: { kind: "terminal", reason: "REFRESH_TOKEN_INVALID" } },
        })

        expect(next).toBe(state) // mesma referência: nada mudou
        expect(next.session.state).toBe("active")
    })

    // (b) um bundle obsoleto não pode ressuscitar tokens depois de um logout.
    // É o bug reproduzível no código atual: o refresh em voo grava o token novo DEPOIS
    // da limpeza do logout.
    it("update de bundle obsoleto NÃO ressuscita tokens após o logout", () => {
        const loggedOut = reducer(activeState(), { type: "logged-out" })

        const next = reducer(loggedOut, {
            type: "received-session-event",
            bundle: bundleA,
            event: { type: "update", credentials: credentialsAt(99) },
        })

        expect(next).toBe(loggedOut)
        expect(next.session.state).toBe("signed-out")
    })

    it("o bundle corrente é aceito normalmente", () => {
        const state = activeState()

        const next = reducer(state, {
            type: "received-session-event",
            bundle: bundleA,
            event: { type: "update", credentials: credentialsAt(1) },
        })

        expect(next).not.toBe(state)
        expect((next.session as any).credentials.generation).toBe(1)
    })

    it("o bundle público (null) não é atingido por evento de bundle real", () => {
        const state = initialState({ schemaVersion: 1, state: "empty" })

        const next = reducer(state, {
            type: "received-session-event",
            bundle: bundleA,
            event: { type: "expired", verdict: { kind: "terminal", reason: "ACCOUNT_BLOCKED" } },
        })

        expect(next).toBe(state)
    })
})

describe("received-session-event", () => {
    it("update troca as credenciais e registra lastRefreshAt", () => {
        const next = reducer(activeState(), {
            type: "received-session-event",
            bundle: bundleA,
            event: { type: "update", credentials: credentialsAt(1) },
        })

        expect((next.session as any).credentials).toMatchObject({
            accessToken: "access-1",
            generation: 1,
        })
        expect((next.session as any).meta.lastRefreshAt).toBeTruthy()
        expect(next.needsPersist).toBe(true)
    })

    // Falha transitória não toca no storage — nada que ela faça sobrevive a um restart.
    it("network-error não muda nada e NÃO marca para persistir", () => {
        const state = activeState()

        const next = reducer(state, {
            type: "received-session-event",
            bundle: bundleA,
            event: { type: "network-error", verdict: { kind: "transient", reason: "HTTP_500" } },
        })

        expect(next).toBe(state)
    })

    it("expired volta ao bundle público e preserva a identidade", () => {
        const next = reducer(activeState(), {
            type: "received-session-event",
            bundle: bundleA,
            event: { type: "expired", verdict: { kind: "terminal", reason: "REFRESH_TOKEN_INVALID" } },
        })

        expect(next.session).toMatchObject({ state: "signed-out", identity, profile })
        expect(next.session).not.toHaveProperty("credentials")
        expect(next.currentBundleState.bundle).toBeNull()
        expect(next.needsPersist).toBe(true)
    })
})

describe("logout e delete", () => {
    it("logout preserva identidade e perfil, descarta credenciais e status", () => {
        const next = reducer(activeState(), { type: "logged-out" })

        expect(next.session).toMatchObject({ state: "signed-out", identity, profile })
        expect(next.session).not.toHaveProperty("credentials")
        expect(next.session).not.toHaveProperty("status")
    })

    // É o que alimenta o "entrar como @fulano" de um toque (§5.8).
    it("o appleUserId sobrevive ao logout", () => {
        const next = reducer(activeState(), { type: "logged-out" })

        expect((next.session as any).identity.appleUserId).toBe("apple-1")
    })

    it("delete de conta leva a empty — só ele apaga a identidade", () => {
        const next = reducer(activeState(), { type: "account-deleted" })

        expect(next.session).toEqual({ schemaVersion: 1, state: "empty" })
        expect(next.needsPersist).toBe(true)
    })

    it("logout sobre sessão já vazia não inventa identidade", () => {
        const state = initialState({ schemaVersion: 1, state: "empty" })

        expect(reducer(state, { type: "logged-out" }).session.state).toBe("empty")
    })
})

describe("patched-profile", () => {
    it("atualiza perfil e status sem tocar nas credenciais", () => {
        const state = activeState()

        const next = reducer(state, {
            type: "patched-profile",
            profile: { name: "Fulano da Silva" },
            status: { verified: false },
        })

        expect((next.session as any).profile).toMatchObject({
            username: "fulano",
            name: "Fulano da Silva",
        })
        expect((next.session as any).status.verified).toBe(false)
        expect((next.session as any).credentials).toEqual(credentialsAt(0))
    })

    it("é ignorado quando não há sessão ativa", () => {
        const loggedOut = reducer(activeState(), { type: "logged-out" })

        expect(reducer(loggedOut, { type: "patched-profile", profile: { name: "x" } })).toBe(
            loggedOut,
        )
    })
})
