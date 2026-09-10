import { describe, expect, it, vi } from "vitest"

import { asChatPush, chatRouteFromPush, isForOpenConversation } from "../chat.push"

// `useFocusEffect` é a única coisa que este módulo usa do expo-router, e importá-lo de
// verdade arrastaria React Native para o teste.
vi.mock("expo-router", () => ({ useFocusEffect: () => {} }))

const payload = {
    type: "NEW_MESSAGE",
    screen: "chat",
    channelId: "dm_100_300",
    messageId: "abc-123",
    actorId: "300",
    actorUsername: "carol",
    messagePreview: "oi",
}

describe("asChatPush", () => {
    it("reconhece o push de mensagem", () => {
        expect(asChatPush(payload)?.channelId).toBe("dm_100_300")
    })

    it("recusa push de outro tipo, mesmo apontando para o chat", () => {
        expect(asChatPush({ ...payload, type: "MOMENT_LIKED" })).toBeNull()
    })

    it("recusa push sem canal — não há para onde navegar", () => {
        expect(asChatPush({ type: "NEW_MESSAGE", screen: "chat" })).toBeNull()
    })

    it("recusa o que não é objeto", () => {
        expect(asChatPush(undefined)).toBeNull()
        expect(asChatPush("NEW_MESSAGE")).toBeNull()
    })

    it("normaliza a foto ausente para null em vez de deixar indefinida", () => {
        expect(asChatPush(payload)?.actorPhotoUrl).toBeNull()
    })
})

describe("chatRouteFromPush", () => {
    it("monta a rota da conversa com o id escapado", () => {
        expect(chatRouteFromPush({ ...payload, channelId: "messaging:dm_1_2" })).toBe(
            "/(tabs)/chat/messaging%3Adm_1_2",
        )
    })

    it("devolve null para push que não é de chat", () => {
        expect(chatRouteFromPush({ type: "MOMENT_LIKED" })).toBeNull()
    })
})

describe("isForOpenConversation", () => {
    it("é falso quando nenhuma conversa está aberta", () => {
        // Sem tela de conversa em foco, todo push de mensagem vira aviso — que é o
        // comportamento certo: a pessoa não está vendo aquela conversa.
        expect(isForOpenConversation(payload)).toBe(false)
    })
})
