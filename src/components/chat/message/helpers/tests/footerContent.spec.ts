import { describe, expect, it } from "vitest"

import { hasFooterContent, showsEdited, showsReplies, showsStatus } from "../footerContent"
import type { MessageOptionsProps, MessageReciveDataProps } from "../../message.types"

const data = (partial: Partial<MessageReciveDataProps> = {}): MessageReciveDataProps =>
    ({
        id: "m1",
        chatId: "messaging:c",
        author: { id: "u1", username: "u", name: "U", profilePicture: null },
        contentType: "text",
        content: "oi",
        status: "sent",
        createdAt: new Date().toISOString(),
        ...partial,
    }) as MessageReciveDataProps

const options = (partial: Partial<MessageOptionsProps> = {}): MessageOptionsProps =>
    ({
        messageType: "text",
        isMine: false,
        isGroup: false,
        isFirstOfGroup: true,
        isLastOfGroup: true,
        followsAudio: false,
        isLatest: false,
        isSelected: false,
        enableReply: true,
        enableForward: true,
        enableCopy: true,
        enableEdit: false,
        enablePin: true,
        enableDelete: false,
        enableReactions: true,
        ...partial,
    }) as MessageOptionsProps

describe("conteúdo do rodapé", () => {
    /*
     * O caso que motivou o helper: recebida que fecha um bloco, sem edição e sem respostas.
     * Antes o rodapé desenhava a caixa vazia e sobrava um vão invisível abaixo dela.
     */
    it("recebida comum não tem nada a mostrar", () => {
        expect(hasFooterContent(data(), options(), "sent")).toBe(false)
    })

    it("minha mensagem mostra o estado de envio", () => {
        expect(hasFooterContent(data(), options({ isMine: true }), "delivered")).toBe(true)
    })

    it('"lida" só na mais recente', () => {
        expect(showsStatus(options({ isMine: true, isLatest: false }), "read")).toBe(false)
        expect(showsStatus(options({ isMine: true, isLatest: true }), "read")).toBe(true)
    })

    it("estado de envio não aparece em mensagem recebida", () => {
        expect(showsStatus(options({ isMine: false }), "failed")).toBe(false)
    })

    it("editada aparece, menos se apagada", () => {
        const edited = data({ editedAt: new Date().toISOString() })
        expect(showsEdited(edited, options())).toBe(true)
        expect(showsEdited(edited, options({ messageType: "deleted" }))).toBe(false)
    })

    it("respostas aparecem, menos se apagada", () => {
        const answered = data({ replyCount: 3 })
        expect(showsReplies(answered, options())).toBe(true)
        expect(showsReplies(answered, options({ messageType: "deleted" }))).toBe(false)
    })

    it("apagada recebida não mostra rodapé nenhum", () => {
        const gone = data({ deletedAt: new Date().toISOString(), replyCount: 2 })
        expect(hasFooterContent(gone, options({ messageType: "deleted" }), "sent")).toBe(false)
    })
})
