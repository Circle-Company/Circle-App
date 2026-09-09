/**
 * A forma do que é persistido em `@circle:session`.
 *
 * Ver `docs/session-management.md` §2.3. Os campos são agrupados por **vida útil**, e o
 * estado da sessão é uma **união discriminada** — não um objeto plano com tudo opcional.
 * Isso faz o compilador cobrar duas coisas que antes dependiam de disciplina:
 *
 *   1. ninguém lê `credentials` sem antes provar que a sessão está ativa;
 *   2. estados impossíveis (access sem refresh, token sem identidade) não compilam.
 */

export const CURRENT_SCHEMA_VERSION = 1

/** Imutável enquanto a conta existe. Sobrevive ao logout. */
export type Identity = {
    /** id do backend — a chave primária de tudo que é do usuário */
    userId: string
    /** `credential.user` do Apple. Ausente em conta migrada do storage antigo, que nunca
     * o guardou; é preenchido no login seguinte. */
    appleUserId?: string
}

/** O par de tokens. Escrito SEMPRE junto — um par misto é um refresh token queimado. */
export type Credentials = {
    accessToken: string
    refreshToken: string
    /** Incrementa a cada rotação. É o que distingue "o token morreu" de "esta request
     * saiu antes da rotação e só precisa ser repetida". */
    generation: number
    /** ISO do relógio local, para diagnóstico. **Não** é autoridade de expiração — essa
     * é o `exp` de dentro do token (§4). */
    issuedAt: string
}

/** Cache de exibição: deixa a tela montar antes da primeira request. Descartável. */
export type ProfileCache = {
    username: string
    name?: string
    profilePicture?: string
}

/** Autoridade do backend. Muda raro, e muda o que o app deixa fazer. */
export type AccountStatus = {
    accessLevel: string
    verified: boolean
    blocked: boolean
    deleted: boolean
}

export type SessionMeta = {
    signedInAt: string
    lastRefreshAt?: string
}

export type EmptySession = {
    schemaVersion: number
    state: "empty"
}

/** Deslogado, mas o device lembra quem era — é o que alimenta o re-auth de um toque (§5.8). */
export type SignedOutSession = {
    schemaVersion: number
    state: "signed-out"
    identity: Identity
    profile: ProfileCache
    signedOutAt: string
}

export type ActiveSession = {
    schemaVersion: number
    state: "active"
    identity: Identity
    credentials: Credentials
    profile: ProfileCache
    status: AccountStatus
    meta: SessionMeta
}

export type PersistedSession = EmptySession | SignedOutSession | ActiveSession

export const EMPTY_SESSION: EmptySession = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    state: "empty",
}

// ── Validação ──────────────────────────────────────────────────────────────────────────
// Regra do §2.2/P3: só `userId` é estritamente obrigatório. Todo o resto é tolerante, para
// que um campo novo (ou ausente) vindo do backend nunca derrube a sessão inteira.

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

const asString = (value: unknown): string | undefined =>
    typeof value === "string" && value.length > 0 ? value : undefined

function parseIdentity(value: unknown): Identity | null {
    if (!isObject(value)) return null

    const userId = asString(value.userId)
    if (!userId) return null

    const appleUserId = asString(value.appleUserId)
    return appleUserId ? { userId, appleUserId } : { userId }
}

function parseCredentials(value: unknown): Credentials | null {
    if (!isObject(value)) return null

    const accessToken = asString(value.accessToken)
    const refreshToken = asString(value.refreshToken)
    // Meio par não é credencial: sem os dois, não há como renovar nem como autenticar.
    if (!accessToken || !refreshToken) return null

    const generation = typeof value.generation === "number" ? value.generation : 0
    return {
        accessToken,
        refreshToken,
        generation,
        issuedAt: asString(value.issuedAt) ?? new Date().toISOString(),
    }
}

function parseProfile(value: unknown): ProfileCache {
    if (!isObject(value)) return { username: "" }
    return {
        username: asString(value.username) ?? "",
        name: asString(value.name),
        profilePicture: asString(value.profilePicture),
    }
}

function parseStatus(value: unknown): AccountStatus {
    const source = isObject(value) ? value : {}
    return {
        accessLevel: asString(source.accessLevel) ?? "",
        verified: source.verified === true,
        blocked: source.blocked === true,
        deleted: source.deleted === true,
    }
}

function parseMeta(value: unknown): SessionMeta {
    const source = isObject(value) ? value : {}
    return {
        signedInAt: asString(source.signedInAt) ?? new Date().toISOString(),
        lastRefreshAt: asString(source.lastRefreshAt),
    }
}

/**
 * Aceita o objeto **na forma esperada**, ou devolve `null` para o chamador degradar.
 * Não conserta nada aqui: consertar é trabalho do `degrade`, e misturar os dois esconderia
 * de onde veio cada decisão.
 */
export function validate(data: unknown): PersistedSession | null {
    if (!isObject(data)) return null

    const schemaVersion =
        typeof data.schemaVersion === "number" ? data.schemaVersion : CURRENT_SCHEMA_VERSION

    if (data.state === "empty") return { schemaVersion, state: "empty" }

    const identity = parseIdentity(data.identity)
    if (!identity) return null

    if (data.state === "signed-out") {
        return {
            schemaVersion,
            state: "signed-out",
            identity,
            profile: parseProfile(data.profile),
            signedOutAt: asString(data.signedOutAt) ?? new Date().toISOString(),
        }
    }

    if (data.state === "active") {
        const credentials = parseCredentials(data.credentials)
        if (!credentials) return null

        return {
            schemaVersion,
            state: "active",
            identity,
            credentials,
            profile: parseProfile(data.profile),
            status: parseStatus(data.status),
            meta: parseMeta(data.meta),
        }
    }

    return null
}

/**
 * Último recurso quando `validate` recusa: **degradar para o estado adjacente, não para o
 * pior estado**.
 *
 * Uma sessão ativa com `credentials` corrompida ainda sabe de quem ela é — o resultado
 * certo é `signed-out` (que oferece o re-auth de um toque), não `empty` (que manda o
 * usuário para uma tela em branco). Só a perda da identidade chega em `empty`.
 *
 * É também o caminho do blob **de versão futura**: uma build antiga lendo um schema mais
 * novo não entende o formato, mas quase sempre reconhece a identidade — e preservá-la é
 * melhor do que apagar tudo por causa de um downgrade de build.
 */
export function degrade(data: unknown): PersistedSession {
    if (!isObject(data)) return EMPTY_SESSION

    const identity = parseIdentity(data.identity)
    if (!identity) return EMPTY_SESSION

    return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        state: "signed-out",
        identity,
        profile: parseProfile(data.profile),
        signedOutAt: new Date().toISOString(),
    }
}
