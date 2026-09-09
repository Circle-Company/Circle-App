import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    APPLE_CREDENTIAL_AUTHORIZED,
    APPLE_CREDENTIAL_NOT_FOUND,
    APPLE_CREDENTIAL_REVOKED,
    APPLE_CREDENTIAL_TRANSFERRED,
    decideEntryScreen,
} from "../apple"
import type { ActiveSession, PersistedSession, SignedOutSession } from "../schema"

// `getCredentialState` é injetado: o pacote nativo não carrega em happy-dom, e o objeto sob
// teste é a tabela de decisão do §5.8, não a ponte para o Apple.
let getCredentialState: ReturnType<typeof vi.fn>

beforeEach(() => {
    getCredentialState = vi.fn()
})

const decide = (session: PersistedSession) => decideEntryScreen(session, { getCredentialState })

const signedOut = (appleUserId?: string): SignedOutSession => ({
    schemaVersion: 1,
    state: "signed-out",
    identity: appleUserId ? { userId: "user-1", appleUserId } : { userId: "user-1" },
    profile: { username: "fulano" },
    signedOutAt: "2026-01-01T00:00:00.000Z",
})

const active: ActiveSession = {
    schemaVersion: 1,
    state: "active",
    identity: { userId: "user-1", appleUserId: "apple-1" },
    credentials: {
        accessToken: "access",
        refreshToken: "refresh",
        generation: 3,
        issuedAt: "2026-01-01T00:00:00.000Z",
    },
    profile: { username: "fulano" },
    status: { accessLevel: "user", verified: true, blocked: false, deleted: false },
    meta: { signedInAt: "2026-01-01T00:00:00.000Z" },
}

describe("decideEntryScreen — a tabela do §5.8", () => {
    it("sessão ativa entra direto no app, sem perguntar nada ao Apple", async () => {
        await expect(decide(active)).resolves.toEqual({ kind: "app" })
        expect(getCredentialState).not.toHaveBeenCalled()
    })

    it("AUTHORIZED vira one-tap carregando o username para 'entrar como @fulano'", async () => {
        getCredentialState.mockResolvedValue(APPLE_CREDENTIAL_AUTHORIZED)

        await expect(decide(signedOut("apple-1"))).resolves.toEqual({
            kind: "one-tap",
            username: "fulano",
            appleUserId: "apple-1",
        })
        expect(getCredentialState).toHaveBeenCalledWith("apple-1")
    })

    it("REVOKED cai no login completo e pede a limpeza do dado por-usuário", async () => {
        getCredentialState.mockResolvedValue(APPLE_CREDENTIAL_REVOKED)

        await expect(decide(signedOut("apple-1"))).resolves.toEqual({
            kind: "full-login",
            reason: "CREDENTIAL_REVOKED",
            clearUserScopedData: true,
        })
    })

    it("NOT_FOUND cai no login completo, sem limpar — o dado ainda pode ser do dono", async () => {
        getCredentialState.mockResolvedValue(APPLE_CREDENTIAL_NOT_FOUND)

        await expect(decide(signedOut("apple-1"))).resolves.toEqual({
            kind: "full-login",
            reason: "CREDENTIAL_NOT_FOUND",
            clearUserScopedData: false,
        })
    })

    it("TRANSFERRED cai no login completo", async () => {
        getCredentialState.mockResolvedValue(APPLE_CREDENTIAL_TRANSFERRED)

        await expect(decide(signedOut("apple-1"))).resolves.toMatchObject({
            kind: "full-login",
            reason: "CREDENTIAL_TRANSFERRED",
        })
    })

    // §5.8, honestidade 3: a conta migrada da Fase 1 nunca guardou o campo.
    it("sem appleUserId vai para o login completo sem sequer consultar o Apple", async () => {
        await expect(decide(signedOut())).resolves.toMatchObject({
            kind: "full-login",
            reason: "NO_APPLE_ANCHOR",
        })
        expect(getCredentialState).not.toHaveBeenCalled()
    })

    it("sessão vazia vai para o login completo", async () => {
        await expect(decide({ schemaVersion: 1, state: "empty" })).resolves.toMatchObject({
            kind: "full-login",
            reason: "NO_SESSION",
        })
        expect(getCredentialState).not.toHaveBeenCalled()
    })

    // O nativo falta no simulador e em iOS antigo. Uma exceção aqui não pode derrubar a
    // decisão de navegação do cold start.
    it("exceção do nativo degrada para login completo em vez de propagar", async () => {
        getCredentialState.mockRejectedValue(new Error("módulo nativo indisponível"))

        await expect(decide(signedOut("apple-1"))).resolves.toMatchObject({
            kind: "full-login",
            reason: "CREDENTIAL_CHECK_FAILED",
        })
    })

    it("valor fora da tabela é tratado como login completo, não como autorizado", async () => {
        getCredentialState.mockResolvedValue(99)

        await expect(decide(signedOut("apple-1"))).resolves.toMatchObject({
            kind: "full-login",
            reason: "CREDENTIAL_UNKNOWN",
        })
    })

    // O `username` tem fallback para "" no schema; oferecer "entrar como @" seria pior que
    // admitir que não sabemos quem é.
    it("sem username guardado não oferece o atalho, mesmo com credencial autorizada", async () => {
        getCredentialState.mockResolvedValue(APPLE_CREDENTIAL_AUTHORIZED)
        const semNome = { ...signedOut("apple-1"), profile: { username: "" } }

        await expect(decide(semNome)).resolves.toMatchObject({
            kind: "full-login",
            reason: "NO_PROFILE_NAME",
        })
        expect(getCredentialState).not.toHaveBeenCalled()
    })
})
