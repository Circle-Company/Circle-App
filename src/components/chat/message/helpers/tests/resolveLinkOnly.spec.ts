import { describe, expect, it } from "vitest"

import { formatLinkForDisplay, isLinkOnly, resolveLinkOnly } from "../resolveLinkOnly"

describe("resolveLinkOnly", () => {
    it.each([
        "https://exemplo.com.br",
        "http://exemplo.com.br",
        "https://exemplo.com.br/caminho/longo?query=1&outro=2#ancora",
        "HTTPS://EXEMPLO.COM.BR",
    ])("reconhece %s como mensagem-link", (content) => {
        expect(resolveLinkOnly(content)).toBe(content.trim())
    })

    it("ignora espaços nas pontas", () => {
        expect(resolveLinkOnly("  https://exemplo.com.br  ")).toBe("https://exemplo.com.br")
    })

    /**
     * A regra é conservadora de propósito: link no meio de frase continua sendo texto comum.
     * Pior que não destacar um link é reinterpretar o texto de alguém como se fosse um.
     */
    it.each([
        ["link no meio da frase", "olha isso https://exemplo.com.br é bom"],
        ["link com texto depois", "https://exemplo.com.br é bom"],
        ["link com texto antes", "olha https://exemplo.com.br"],
        ["dois links", "https://a.com https://b.com"],
        ["sem protocolo", "exemplo.com.br"],
        ["protocolo não http", "ftp://exemplo.com.br"],
        ["só texto", "bom dia"],
        ["texto vazio", ""],
    ])("não trata %s como mensagem-link", (_label, content) => {
        expect(resolveLinkOnly(content)).toBeNull()
    })

    it("null e undefined não quebram", () => {
        expect(resolveLinkOnly(null)).toBeNull()
        expect(resolveLinkOnly(undefined)).toBeNull()
    })

    it("isLinkOnly acompanha o resolve", () => {
        expect(isLinkOnly("https://exemplo.com.br")).toBe(true)
        expect(isLinkOnly("bom dia")).toBe(false)
    })
})

describe("formatLinkForDisplay", () => {
    it.each([
        ["https://exemplo.com.br", "exemplo.com.br"],
        ["http://exemplo.com.br", "exemplo.com.br"],
        ["HTTPS://Exemplo.com.br/Caminho", "Exemplo.com.br/Caminho"],
        ["https://exemplo.com.br/a?b=1#c", "exemplo.com.br/a?b=1#c"],
    ])("corta o protocolo de %s", (url, expected) => {
        expect(formatLinkForDisplay(url)).toBe(expected)
    })

    // Só o começo: um "http://" no meio do caminho é parte do endereço, não protocolo.
    it("não corta ocorrência no meio do endereço", () => {
        expect(formatLinkForDisplay("https://exemplo.com/r?u=http://outro.com")).toBe(
            "exemplo.com/r?u=http://outro.com",
        )
    })

    it("endereço sem protocolo passa intacto", () => {
        expect(formatLinkForDisplay("exemplo.com.br")).toBe("exemplo.com.br")
    })
})
