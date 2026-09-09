import { isScopedKey, safeDelete, storage, storageKeys } from "@/store"

/**
 * Escopo de cada chave do storage — `docs/session-management.md` §2.2 e §11.2.
 *
 * `clearSessionDataPreservingTutorial()` decide por prefixo de string com o tutorial
 * hardcoded como **exceção**. A consequência é que toda chave nova nasce implicitamente
 * "apaga no logout", e a única forma de descobrir isso é ler a função. Aqui a declaração
 * é invertida: quem manda é a tabela, e a varredura é derivada dela.
 */

export type KeyScope =
    /** Vive e morre com o par de tokens. Dono: `src/session/`. */
    | "session"
    /** É do usuário logado. **Tem** que sumir no logout e na troca de Apple ID (§2.6). */
    | "user"
    /** É do aparelho, não de quem está logado nele. Sobrevive a tudo menos ao uninstall. */
    | "device"

const BASE = storageKeys().baseKey

/**
 * Prefixos declarados, do modelo alvo (§2.2) **e** das chaves legadas que ainda existem
 * em `storageKeys()` enquanto a migração do §12 não termina. Deixar as legadas de fora
 * seria reabrir exatamente o vazamento que esta tabela existe para fechar.
 *
 * A resolução é por **prefixo mais longo**: `@circle:account:jwt:` é sessão embora
 * `@circle:account:` seja do usuário.
 */
export const KEY_SCOPES: Readonly<Record<string, KeyScope>> = {
    // ── modelo alvo (§2.2) ─────────────────────────────────────────────────────────────
    [BASE + "session"]: "session",
    // Cobre o blob e todo o prefixo `@circle:account:*` — inclusive as chaves legadas do
    // modelo antigo, que continuam no disco até a limpeza final.
    [BASE + "account"]: "user",
    [BASE + "metrics"]: "user",
    [BASE + "preferences"]: "device", // idioma e timezone são do aparelho
    [BASE + "device"]: "device",
    [BASE + "tutorial"]: "device",
    [BASE + "clock-offset"]: "device",
    [BASE + "push-token"]: "device",

    // ── chaves de hoje, ainda vivas ────────────────────────────────────────────────────
    [BASE + "account:jwt:"]: "session",
    [BASE + "account:"]: "user",
    [BASE + "user:"]: "user",
    [BASE + "statistics:"]: "user",
    [BASE + "permissions:"]: "device",
    [BASE + "camera:"]: "device",
    [BASE + "clockoffset"]: "device",
    // Efêmera por design (§2.2), mas ainda assim do usuário: a memória de "já apertei
    // like neste item" não pode atravessar para a próxima conta.
    [BASE + "like:pressed:"]: "user",
}

/**
 * Escopo padrão de uma chave `@circle:` que ninguém declarou.
 *
 * `"user"` é o lado seguro: uma chave nova esquecida some no logout, em vez de vazar de
 * uma conta para a outra. O custo é perder dado de aparelho que deveria ter sobrevivido —
 * incômodo, não incidente. Por isso `findUndeclaredKeys()` existe: o esquecimento é
 * recuperável, mas precisa ser **visível**.
 */
const UNDECLARED_SCOPE: KeyScope = "user"

const PREFIXES = Object.keys(KEY_SCOPES).sort((a, b) => b.length - a.length)

/** `true` quando a chave casa com algum prefixo da tabela. */
export function isDeclared(key: string): boolean {
    return PREFIXES.some((prefix) => key === prefix || key.startsWith(prefix))
}

/** Escopo declarado da chave, pelo prefixo mais longo que casa. */
export function resolveScope(key: string): KeyScope {
    for (const prefix of PREFIXES) {
        if (key === prefix || key.startsWith(prefix)) return KEY_SCOPES[prefix]
    }
    return UNDECLARED_SCOPE
}

const readAllKeys = (): string[] => {
    try {
        const anyStorage = storage as any
        return typeof anyStorage.getAllKeys === "function" ? anyStorage.getAllKeys() : []
    } catch {
        return []
    }
}

/**
 * Chaves do app que não estão na tabela. Serve para o teste de regressão e para um aviso
 * em desenvolvimento — é o que impede a tabela de envelhecer em silêncio.
 */
export function findUndeclaredKeys(): string[] {
    return readAllKeys().filter(
        (key) => typeof key === "string" && key.startsWith(BASE) && !isDeclared(key),
    )
}

/**
 * Apaga tudo que é do usuário logado, preservando aparelho e sessão.
 *
 * Chamado em **dois** lugares (§2.6): no logout e no login com um Apple ID diferente do
 * que está guardado — este segundo é o que hoje não existe, e é por isso que um segundo
 * usuário no mesmo aparelho herda os likes e as notificações lidas do primeiro.
 *
 * Não toca no escopo `session`: a transição `active → signed-out` é **uma escrita** do
 * blob de sessão, feita pelo `SessionStore` (§5.7). Apagar a chave aqui destruiria junto
 * a identidade que o re-auth de um toque (§5.8) precisa para oferecer "entrar como
 * @fulano".
 */
export function clearUserScopedData(): void {
    // As chaves sem escopo são coletadas durante a varredura, não depois: ao fim dela
    // não existem mais, e o aviso não teria o que reportar.
    const undeclared: string[] = []

    for (const key of readAllKeys()) {
        // Fora do namespace do app não é nosso: a instância padrão do MMKV é
        // compartilhada, e varrer o que não declaramos apagaria dado de terceiros.
        if (!isScopedKey(key)) continue
        if (!isDeclared(key)) undeclared.push(key)
        if (resolveScope(key) === "user") safeDelete(key)
    }

    if (__DEV__ && undeclared.length > 0) {
        console.warn(
            "[scopes] chaves sem escopo declarado foram tratadas como 'user' e apagadas:",
            undeclared,
        )
    }
}
