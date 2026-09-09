import { describe, expect, it, vi } from "vitest"

import { OpaqueBundle } from "../reducer"
import { AccountStatus, Credentials, Identity, PersistedSession, ProfileCache } from "../schema"
import { SessionStore } from "../store"

const identity: Identity = { userId: "user-1", appleUserId: "apple-1" }
const profile: ProfileCache = { username: "fulano" }
const status: AccountStatus = {
    accessLevel: "USER",
    verified: false,
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

function makeStore(initial: PersistedSession = { schemaVersion: 1, state: "empty" }) {
    const persisted: PersistedSession[] = []
    const store = new SessionStore(initial, (session) => persisted.push(session))
    return { store, persisted }
}

const signIn = (bundle: OpaqueBundle, generation = 0) =>
    ({
        type: "signed-in",
        bundle,
        identity,
        credentials: credentialsAt(generation),
        profile,
        status,
    }) as const

describe("persistência", () => {
    // A propriedade central: grava no dispatch, não no render.
    it("persiste de forma síncrona, antes de notificar os listeners", () => {
        const order: string[] = []
        const store = new SessionStore({ schemaVersion: 1, state: "empty" }, () =>
            order.push("persist"),
        )
        store.subscribe(() => order.push("listener"))

        store.dispatch(signIn(bundleA))

        expect(order).toEqual(["persist", "listener"])
    })

    it("o que vai ao storage é state.session, sem transformação", () => {
        const { store, persisted } = makeStore()

        store.dispatch(signIn(bundleA))

        expect(persisted).toHaveLength(1)
        expect(persisted[0]).toBe(store.getSession())
    })

    it("limpa needsPersist depois de gravar", () => {
        const { store } = makeStore()

        store.dispatch(signIn(bundleA))

        expect(store.getState().needsPersist).toBe(false)
    })

    it("network-error não persiste — nada dele sobrevive a um restart", () => {
        const { store, persisted } = makeStore()
        store.dispatch(signIn(bundleA))
        persisted.length = 0

        store.dispatch({
            type: "received-session-event",
            bundle: bundleA,
            event: { type: "network-error", verdict: { kind: "transient", reason: "HTTP_500" } },
        })

        expect(persisted).toEqual([])
    })

    it("uma rotação persiste o par novo numa escrita só", () => {
        const { store, persisted } = makeStore()
        store.dispatch(signIn(bundleA))
        persisted.length = 0

        store.dispatch({
            type: "received-session-event",
            bundle: bundleA,
            event: { type: "update", credentials: credentialsAt(1) },
        })

        expect(persisted).toHaveLength(1)
        expect((persisted[0] as any).credentials).toMatchObject({
            accessToken: "access-1",
            refreshToken: "refresh-1",
        })
    })
})

describe("notificação", () => {
    it("ação rejeitada pelo guard não notifica nem persiste", () => {
        const { store, persisted } = makeStore()
        store.dispatch(signIn(bundleA))
        persisted.length = 0

        const listener = vi.fn()
        store.subscribe(listener)

        store.dispatch({
            type: "received-session-event",
            bundle: { name: "obsoleto" },
            event: { type: "expired", verdict: { kind: "terminal", reason: "ACCOUNT_BLOCKED" } },
        })

        expect(listener).not.toHaveBeenCalled()
        expect(persisted).toEqual([])
    })

    it("unsubscribe para de receber", () => {
        const { store } = makeStore()
        const listener = vi.fn()
        const unsubscribe = store.subscribe(listener)

        store.dispatch(signIn(bundleA))
        unsubscribe()
        store.dispatch({ type: "logged-out" })

        expect(listener).toHaveBeenCalledTimes(1)
    })

    it("um listener que lança não impede os outros", () => {
        vi.spyOn(console, "warn").mockImplementation(() => {})
        const { store } = makeStore()
        const second = vi.fn()

        store.subscribe(() => {
            throw new Error("listener quebrado")
        })
        store.subscribe(second)

        store.dispatch(signIn(bundleA))

        expect(second).toHaveBeenCalledTimes(1)
    })
})

describe("estado inicial", () => {
    it("carrega a sessão de disco mas sobe com o bundle público", () => {
        const { store } = makeStore({
            schemaVersion: 1,
            state: "active",
            identity,
            credentials: credentialsAt(2),
            profile,
            status,
            meta: { signedInAt: "2026-01-01T00:00:00.000Z" },
        })

        expect(store.getSession().state).toBe("active")
        expect(store.getState().currentBundleState.bundle).toBeNull()
    })

    it("não grava nada só por ser construído", () => {
        const { persisted } = makeStore()

        expect(persisted).toEqual([])
    })
})
