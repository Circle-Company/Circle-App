import type { AxiosInstance } from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    NotAuthenticatedError,
    assertAuthenticated,
    buildBundle,
    buildPublicBundle,
    disposeBundle,
    isBundleDisposed,
    isSessionBundle,
    registerBundleKillSwitch,
    type AnyBundle,
    type PublicBundle,
    type SessionBundle,
} from "../bundle"
import type { Session } from "../session"

/**
 * Dublê da `Session`. O bundle só toca em `accessToken`, `isDestroyed` e `kill()` — o resto
 * da classe não interessa aqui, e instanciá-la de verdade traria o refresh junto.
 */
function fakeSession(overrides: Partial<{ accessToken: string; isDestroyed: boolean }> = {}) {
    const session = {
        accessToken: overrides.accessToken ?? "access-1",
        isDestroyed: overrides.isDestroyed ?? false,
        kill: vi.fn(() => {
            session.isDestroyed = true
        }),
    }
    return session
}

/** `AxiosInstance` de mentira: o mock global de axios do `test-setup` não serve de client. */
const fakeClient = (): AxiosInstance => ({ marker: Symbol("client") }) as unknown as AxiosInstance

beforeEach(() => {
    vi.restoreAllMocks()
})

describe("buildBundle", () => {
    it("amarra o client à sessão e entrega o próprio bundle à fábrica", () => {
        const session = fakeSession()
        const client = fakeClient()
        const createClient = vi.fn(() => client)

        const bundle = buildBundle(session as unknown as Session, createClient)

        expect(bundle.session).toBe(session)
        expect(bundle.client).toBe(client)
        // A mesma referência: é ela que o guard de identidade do §6 compara.
        expect(createClient).toHaveBeenCalledWith(bundle)
    })

    it("a fábrica recebe o bundle antes de `client` existir, mas o interceptor o vê preenchido", () => {
        const session = fakeSession()
        let seenDuringFactory: unknown = "não lido"

        const bundle = buildBundle(session as unknown as Session, (b) => {
            // O ciclo bundle ↔ client é quebrado aqui: síncrono ainda não há client.
            seenDuringFactory = b.client
            return { readLater: () => b.client } as unknown as AxiosInstance
        })

        expect(seenDuringFactory).toBeUndefined()
        // Já o interceptor, que roda depois, enxerga o campo preenchido.
        expect((bundle.client as unknown as { readLater: () => unknown }).readLater()).toBe(
            bundle.client,
        )
    })
})

describe("buildPublicBundle", () => {
    it("tem `session: null` como discriminante, não `undefined`", () => {
        const bundle = buildPublicBundle(() => fakeClient())

        expect(bundle.session).toBeNull()
        expect("session" in bundle).toBe(true)
        expect(isSessionBundle(bundle)).toBe(false)
    })

    it("o client público lança NotAuthenticatedError ANTES de qualquer I/O", async () => {
        const transport = vi.fn(async () => ({ status: 200 }))

        const bundle: PublicBundle = buildPublicBundle((b) => {
            // Imita o interceptor de request: o guard roda antes de o transporte ser tocado.
            const request = async (_url: string) => {
                assertAuthenticated(b)
                return transport()
            }
            return { get: request } as unknown as AxiosInstance
        })

        const client = bundle.client as unknown as { get: (url: string) => Promise<unknown> }

        await expect(client.get("/account")).rejects.toBeInstanceOf(NotAuthenticatedError)
        // O ponto do teste: nenhuma request saiu do device, não houve 401 opaco do servidor.
        expect(transport).not.toHaveBeenCalled()
    })
})

describe("assertAuthenticated", () => {
    it("aceita o bundle autenticado e estreita o tipo", () => {
        const session = fakeSession()
        const bundle: AnyBundle = buildBundle(session as unknown as Session, () => fakeClient())

        expect(() => assertAuthenticated(bundle)).not.toThrow()
        assertAuthenticated(bundle)
        expect(bundle.session.accessToken).toBe("access-1")
    })

    it("recusa bundle ausente", () => {
        expect(() => assertAuthenticated(null)).toThrow(NotAuthenticatedError)
        expect(() => assertAuthenticated(undefined)).toThrow(NotAuthenticatedError)
    })

    it("recusa bundle já descartado", () => {
        const bundle = buildBundle(fakeSession() as unknown as Session, () => fakeClient())
        disposeBundle(bundle)

        // Cenário (b) do §6: uma query em voo segurando o bundle de uma sessão encerrada.
        expect(() => assertAuthenticated(bundle)).toThrow(NotAuthenticatedError)
    })

    it("recusa bundle cuja sessão foi morta por fora", () => {
        const session = fakeSession({ isDestroyed: true })
        const bundle = buildBundle(session as unknown as Session, () => fakeClient())

        expect(() => assertAuthenticated(bundle)).toThrow(/sessão descartada/)
    })
})

describe("disposeBundle", () => {
    it("roda o kill switch registrado e mata a sessão", () => {
        const session = fakeSession()
        const bundle = buildBundle(session as unknown as Session, () => fakeClient())
        const kill = vi.fn()

        registerBundleKillSwitch(bundle, kill)
        disposeBundle(bundle)

        expect(kill).toHaveBeenCalledTimes(1)
        expect(session.kill).toHaveBeenCalledTimes(1)
        expect(isBundleDisposed(bundle)).toBe(true)
    })

    it("é idempotente: o segundo descarte não roda nada de novo", () => {
        const session = fakeSession()
        const bundle = buildBundle(session as unknown as Session, () => fakeClient())
        const kill = vi.fn()

        registerBundleKillSwitch(bundle, kill)
        disposeBundle(bundle)
        disposeBundle(bundle)
        disposeBundle(bundle)

        expect(kill).toHaveBeenCalledTimes(1)
        expect(session.kill).toHaveBeenCalledTimes(1)
    })

    it("não entra em laço quando o próprio kill switch descarta o bundle de novo", () => {
        const bundle = buildBundle(fakeSession() as unknown as Session, () => fakeClient())
        const kill = vi.fn(() => disposeBundle(bundle))

        registerBundleKillSwitch(bundle, kill)
        disposeBundle(bundle)

        // A marcação acontece antes da execução, então a reentrância para na primeira linha.
        expect(kill).toHaveBeenCalledTimes(1)
    })

    it("não lança quando o kill switch lança", () => {
        const session = fakeSession()
        const bundle = buildBundle(session as unknown as Session, () => fakeClient())
        vi.spyOn(console, "warn").mockImplementation(() => {})

        registerBundleKillSwitch(bundle, () => {
            throw new Error("teardown quebrado")
        })

        expect(() => disposeBundle(bundle)).not.toThrow()
        // E o descarte continua: a sessão morre mesmo com o teardown falhando.
        expect(session.kill).toHaveBeenCalledTimes(1)
    })

    it("não lança quando o kill() da sessão lança", () => {
        const bundle = {
            session: {
                kill: () => {
                    throw new Error("sessão quebrada")
                },
            },
            client: fakeClient(),
        } as unknown as SessionBundle
        vi.spyOn(console, "warn").mockImplementation(() => {})

        expect(() => disposeBundle(bundle)).not.toThrow()
        expect(isBundleDisposed(bundle)).toBe(true)
    })

    it("não lança sem kill switch registrado, nem com bundle público, nem com null", () => {
        const bundle = buildBundle(fakeSession() as unknown as Session, () => fakeClient())
        const publicBundle = buildPublicBundle(() => fakeClient())

        expect(() => disposeBundle(bundle)).not.toThrow()
        expect(() => disposeBundle(publicBundle)).not.toThrow()
        expect(() => disposeBundle(null)).not.toThrow()
        expect(() => disposeBundle(undefined)).not.toThrow()
        expect(isBundleDisposed(publicBundle)).toBe(true)
    })

    it("descarta um bundle sem afetar o outro", () => {
        const a = buildBundle(fakeSession() as unknown as Session, () => fakeClient())
        const b = buildBundle(fakeSession() as unknown as Session, () => fakeClient())
        const killA = vi.fn()
        const killB = vi.fn()

        registerBundleKillSwitch(a, killA)
        registerBundleKillSwitch(b, killB)
        disposeBundle(a)

        expect(killA).toHaveBeenCalledTimes(1)
        expect(killB).not.toHaveBeenCalled()
        expect(isBundleDisposed(b)).toBe(false)
    })
})
