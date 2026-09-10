import { beforeEach, describe, expect, it, vi } from "vitest"

import { ChatUnavailableError, NotFriendsError } from "@/api/chat/chat"

import { connectChatSession, resetChatAvailability, statusForConnectionError } from "../connection"

/*
 * Os dois módulos que a conexão toca por fora ficam mockados: a rede e o SDK. O que sobra é
 * exatamente o que este arquivo decide — quando pedir credencial, quando desistir, e o que a
 * UI vê no lugar do erro.
 *
 * `vi.mock` com import ESM (e não `require`) porque é a única forma que a fábrica alcança
 * neste projeto — ver CLAUDE.md > Testing.
 */
const issueToken = vi.fn()
const connectChatUser = vi.fn()
const disconnectChatUser = vi.fn()

vi.mock("@/api", () => ({
    apiRoutes: { chat: { issueToken: (...args: unknown[]) => issueToken(...args) } },
}))

vi.mock("@/features/chat", () => ({
    connectChatUser: (...args: unknown[]) => connectChatUser(...args),
    disconnectChatUser: (...args: unknown[]) => disconnectChatUser(...args),
}))

const credential = {
    apiKey: "key",
    userId: "100",
    token: "token-1",
    expiresAt: "2026-01-01T00:00:00.000Z",
}

beforeEach(() => {
    vi.clearAllMocks()
    resetChatAvailability()
    connectChatUser.mockResolvedValue({ userID: "100" })
})

describe("statusForConnectionError", () => {
    it("trata chat desligado como indisponível, e não como erro", () => {
        // A distinção é o que decide entre esconder a aba e oferecer "tentar de novo".
        expect(statusForConnectionError(new ChatUnavailableError())).toBe("unavailable")
    })

    it("trata qualquer outra falha como erro retentável", () => {
        expect(statusForConnectionError(new Error("network"))).toBe("error")
        expect(statusForConnectionError(new NotFriendsError())).toBe("error")
    })
})

describe("connectChatSession", () => {
    it("conecta com a apiKey emitida e sem escrever perfil", async () => {
        issueToken.mockResolvedValue(credential)

        await connectChatSession("100")

        expect(connectChatUser).toHaveBeenCalledTimes(1)
        const params = connectChatUser.mock.calls[0][0]
        expect(params.apiKey).toBe("key")
        expect(params.userId).toBe("100")
        expect(typeof params.token).toBe("function")
        // Nome e foto são do backend: mandá-los daqui criaria uma segunda fonte do perfil.
        expect(params).not.toHaveProperty("name")
        expect(params).not.toHaveProperty("image")
    })

    it("reaproveita o primeiro token e só depois emite outro", async () => {
        issueToken.mockResolvedValue(credential)
        await connectChatSession("100")
        const tokenProvider = connectChatUser.mock.calls[0][0].token

        // A primeira renovação é a própria conexão inicial: pedir de novo desperdiçaria a
        // emissão que acabou de acontecer.
        await expect(tokenProvider()).resolves.toBe("token-1")
        expect(issueToken).toHaveBeenCalledTimes(1)

        issueToken.mockResolvedValue({ ...credential, token: "token-2" })
        await expect(tokenProvider()).resolves.toBe("token-2")
        expect(issueToken).toHaveBeenCalledTimes(2)
    })

    it("recusa credencial emitida para outra pessoa", async () => {
        issueToken.mockResolvedValue({ ...credential, userId: "999" })

        await expect(connectChatSession("100")).rejects.toThrow("CHAT_TOKEN_IDENTITY_MISMATCH")
        expect(connectChatUser).not.toHaveBeenCalled()
    })

    it("não pede credencial de novo depois de um 503", async () => {
        issueToken.mockRejectedValue(new ChatUnavailableError())

        await expect(connectChatSession("100")).rejects.toBeInstanceOf(ChatUnavailableError)
        await expect(connectChatSession("100")).rejects.toBeInstanceOf(ChatUnavailableError)

        // O ambiente não tem o provedor configurado; tentar de novo só produz outro 503.
        expect(issueToken).toHaveBeenCalledTimes(1)
    })

    it("volta a tentar depois que a sessão é encerrada", async () => {
        issueToken.mockRejectedValueOnce(new ChatUnavailableError())
        await expect(connectChatSession("100")).rejects.toBeInstanceOf(ChatUnavailableError)

        resetChatAvailability()
        issueToken.mockResolvedValue(credential)

        await expect(connectChatSession("100")).resolves.toBeDefined()
    })
})
