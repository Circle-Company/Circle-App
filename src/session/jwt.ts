import { storage, storageKeys } from "@/store"

/**
 * Leitura de JWT e correção de relógio.
 *
 * O app **não valida assinatura** — isso é do servidor. Aqui só decodificamos o payload
 * para responder duas perguntas: quando este token expira, e de quem ele é. Ver
 * `docs/session-management.md` §4.
 */

/** Margem aplicada a toda checagem de expiração: um token que vence dentro desta janela
 * é tratado como expirado. Um token que expira durante o voo da request é um 401 evitável. */
export const EXPIRATION_SKEW_MS = 30_000

/** Só reescrevemos o offset quando ele muda de forma relevante — evita escrever no MMKV
 * a cada resposta da API por causa de alguns milissegundos de diferença. */
const MIN_OFFSET_CHANGE_MS = 30_000

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

/**
 * Decodifica base64url sem depender de `atob` — que existe no Hermes e no ambiente de
 * teste, mas não é garantido em todo runtime que o app pode acabar rodando.
 *
 * Devolve os bytes como string latin1. Para os campos que lemos (`exp`, `sub`, `scope` —
 * todos ASCII) isso é equivalente a UTF-8; um payload com acentos em **outros** campos
 * ficaria com mojibake naqueles campos, mas o `JSON.parse` continua funcionando.
 */
function base64UrlDecode(input: string): string | null {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/")
    let out = ""
    let buffer = 0
    let bits = 0

    for (const char of normalized) {
        if (char === "=") break
        const value = B64.indexOf(char)
        if (value === -1) return null // caractere fora do alfabeto: payload inválido

        buffer = (buffer << 6) | value
        bits += 6
        if (bits >= 8) {
            bits -= 8
            out += String.fromCharCode((buffer >> bits) & 0xff)
        }
    }

    return out
}

/** Payload decodificado, ou `null` se o token não for um JWT legível. */
export function decodeJwtPayload(token: string | undefined): Record<string, unknown> | null {
    if (!token) return null

    const parts = token.split(".")
    if (parts.length !== 3) return null

    try {
        const json = base64UrlDecode(parts[1])
        if (!json) return null

        const parsed = JSON.parse(json)
        return parsed && typeof parsed === "object" ? parsed : null
    } catch {
        return null
    }
}

/** `exp` em segundos, ou `null` se ausente/ilegível. */
export function decodeExp(token: string | undefined): number | null {
    const exp = decodeJwtPayload(token)?.exp
    return typeof exp === "number" && Number.isFinite(exp) ? exp : null
}

/** `sub` — usado na migração da Fase 1 quando o `userId` não está no storage antigo. */
export function decodeSub(token: string | undefined): string | null {
    const sub = decodeJwtPayload(token)?.sub
    if (typeof sub === "string" && sub) return sub
    if (typeof sub === "number") return String(sub)
    return null
}

// ── Correção de relógio ────────────────────────────────────────────────────────────────
// O device pode estar com a hora errada, e decidir expiração com relógio adiantado desloga
// usuário com sessão válida. O header `Date` de qualquer resposta dá a hora do servidor de
// graça — basta guardar a diferença.

export function getClockOffsetMs(): number {
    try {
        const stored = storage.getNumber(storageKeys().clockOffset)
        return typeof stored === "number" && Number.isFinite(stored) ? stored : 0
    } catch {
        return 0
    }
}

/**
 * Registra o offset a partir do header `Date` de uma resposta. Silenciosamente ignora
 * datas ilegíveis — um proxy que devolve lixo nesse header não pode quebrar o app.
 */
export function recordServerTime(dateHeader: string | undefined | null): void {
    if (!dateHeader) return

    const serverMs = Date.parse(dateHeader)
    if (!Number.isFinite(serverMs)) return

    const offset = serverMs - Date.now()
    try {
        if (Math.abs(offset - getClockOffsetMs()) < MIN_OFFSET_CHANGE_MS) return
        storage.set(storageKeys().clockOffset, offset)
    } catch {
        // storage indisponível não pode quebrar uma resposta bem-sucedida
    }
}

/** "Agora" segundo o servidor: o relógio local corrigido pelo offset conhecido. */
export function now(): number {
    return Date.now() + getClockOffsetMs()
}

/**
 * Expiração do **access token**. Um token sem `exp`, ilegível ou vencido dentro da margem
 * conta como expirado — o lado seguro é sempre "renove", nunca "confie".
 *
 * ⚠️ **Nunca aplique isto ao refresh token.** Pelo contrato do backend, o refresh token é
 * emitido **sem claim `exp`**: ele não expira, e quem decide se ainda serve é o banco
 * (`active` vs `used`). Como "sem `exp`" aqui significa "expirado", passar o refresh token
 * devolveria `true` sempre — e o app se declararia deslogado com uma sessão perfeitamente
 * viva. É por isso que o nome diz `AccessToken`, e não `Token`.
 */
export function isAccessTokenExpired(
    token: string | undefined,
    skewMs = EXPIRATION_SKEW_MS,
): boolean {
    const exp = decodeExp(token)
    if (exp === null) return true
    return exp * 1000 <= now() + skewMs
}
