import { describe, expect, it } from "vitest"

import {
    CURRENT_SCHEMA_VERSION,
    EMPTY_SESSION,
    degrade,
    validate,
    type ActiveSession,
} from "../schema"

const identity = { userId: "user-1", appleUserId: "apple-1" }
const profile = { username: "fulano", name: "Fulano", profilePicture: "https://cdn/f.jpg" }

const activeSession: ActiveSession = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    state: "active",
    identity,
    credentials: {
        accessToken: "access",
        refreshToken: "refresh",
        generation: 3,
        issuedAt: "2026-01-01T00:00:00.000Z",
    },
    profile,
    status: { accessLevel: "USER", verified: true, blocked: false, deleted: false },
    meta: { signedInAt: "2026-01-01T00:00:00.000Z" },
}

describe("validate", () => {
    it("aceita uma sessão ativa completa sem alterá-la", () => {
        expect(validate(JSON.parse(JSON.stringify(activeSession)))).toEqual(activeSession)
    })

    it("aceita signed-out e não exige credenciais", () => {
        const session = validate({
            schemaVersion: 1,
            state: "signed-out",
            identity,
            profile,
            signedOutAt: "2026-01-02T00:00:00.000Z",
        })

        expect(session).toMatchObject({ state: "signed-out", identity })
        expect(session).not.toHaveProperty("credentials")
    })

    it("aceita empty", () => {
        expect(validate({ schemaVersion: 1, state: "empty" })).toEqual({
            schemaVersion: 1,
            state: "empty",
        })
    })

    it("recusa sessão sem userId", () => {
        expect(validate({ ...activeSession, identity: { appleUserId: "apple-1" } })).toBeNull()
        expect(validate({ ...activeSession, identity: { userId: "" } })).toBeNull()
    })

    // Meio par de tokens é justamente o estado que o desenho existe para impedir.
    it("recusa credenciais com só metade do par", () => {
        expect(
            validate({ ...activeSession, credentials: { accessToken: "access", generation: 1 } }),
        ).toBeNull()
        expect(
            validate({ ...activeSession, credentials: { refreshToken: "refresh", generation: 1 } }),
        ).toBeNull()
    })

    it("recusa estado desconhecido e valores que não são objeto", () => {
        expect(validate({ schemaVersion: 1, state: "zumbi", identity })).toBeNull()
        expect(validate(null)).toBeNull()
        expect(validate("uma string")).toBeNull()
        expect(validate([])).toBeNull()
    })

    it("tolera campos opcionais ausentes — o backend pode mudar sem derrubar a sessão", () => {
        const session = validate({
            schemaVersion: 1,
            state: "active",
            identity: { userId: "user-1" },
            credentials: { accessToken: "a", refreshToken: "r" },
        })

        expect(session).toMatchObject({
            state: "active",
            identity: { userId: "user-1" },
            profile: { username: "" },
            status: { accessLevel: "", verified: false, blocked: false, deleted: false },
        })
        // generation ausente vira 0, não NaN nem undefined
        expect((session as ActiveSession).credentials.generation).toBe(0)
    })

    it("ignora campos extras desconhecidos", () => {
        const session = validate({ ...activeSession, campoDoFuturo: { qualquer: "coisa" } })

        expect(session).toEqual(activeSession)
    })

    it("preserva a versão do blob lido, mesmo maior que a atual", () => {
        expect(validate({ ...activeSession, schemaVersion: 99 })).toMatchObject({
            schemaVersion: 99,
        })
    })
})

describe("degrade", () => {
    // O ponto da função: degradar para o estado adjacente, não para o pior estado.
    it("sessão ativa com credenciais corrompidas vira signed-out, preservando a identidade", () => {
        const result = degrade({ ...activeSession, credentials: { accessToken: "só-metade" } })

        expect(result).toMatchObject({ state: "signed-out", identity, profile })
        expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    })

    it("blob de versão futura mantém a identidade em vez de deslogar para sempre", () => {
        const result = degrade({
            schemaVersion: 99,
            state: "algo-que-ainda-nao-existe",
            identity,
            profile,
        })

        expect(result).toMatchObject({ state: "signed-out", identity })
    })

    it("sem identidade utilizável, cai em empty", () => {
        expect(degrade({ state: "active", credentials: activeSession.credentials })).toEqual(
            EMPTY_SESSION,
        )
        expect(degrade(null)).toEqual(EMPTY_SESSION)
        expect(degrade({ identity: { userId: "" } })).toEqual(EMPTY_SESSION)
    })

    it("não carrega credenciais para o estado degradado", () => {
        const result = degrade({ ...activeSession, credentials: { accessToken: "x" } })

        expect(result).not.toHaveProperty("credentials")
        expect(result).not.toHaveProperty("status")
    })
})
