import { storage, storageKeys, safeDelete, type ScopedKey } from "@/store"

import { Credentials, Identity } from "./schema"
import { Session, type RefreshRequest, type SessionEvent } from "./session"
import { SessionStore } from "./store"
import { decodeSub } from "./jwt"
import { readSession, writeSession } from "./storage"

/**
 * A ponte da Fase 2 (`docs/session-management.md` §12).
 *
 * Aqui a `Session` passa a ser a **dona do refresh**, e o interceptor delega para ela. Mas
 * as chaves antigas do MMKV continuam sendo o storage de referência do app — o interceptor
 * de request ainda lê `account:jwt:token`, e o login ainda escreve por lá. Trocar isso é a
 * Fase 3.
 *
 * Enquanto as duas representações coexistem, esta é a regra:
 *
 *   as chaves antigas são a FONTE das credenciais; a `Session` é a única que as ROTACIONA.
 *
 * Uma rotação bem-sucedida escreve nos dois lugares. É deliberadamente redundante, e é o
 * que permite que a fase seja revertida sem perder sessão de ninguém.
 */

let store: SessionStore | null = null
let current: Session | null = null

/** Chamado quando a sessão morre de vez. O AuthProvider se inscreve via `src/api`. */
type ExpiredHandler = (event: Extract<SessionEvent, { type: "expired" }>) => void
let onExpired: ExpiredHandler | null = null

export function setExpiredHandler(handler: ExpiredHandler | null): void {
    onExpired = handler
}

export function getStore(): SessionStore {
    if (!store) store = new SessionStore()
    return store
}

/**
 * Toda leitura aqui é defensiva de propósito. Este código roda **dentro do tratamento de
 * 401**: uma exceção não derruba só o refresh, derruba o caminho de recuperação inteiro, e
 * o usuário fica preso com uma tela de erro sem saber por quê.
 */
const readKey = (key: ScopedKey | undefined): string | undefined =>
    key ? storage.getString(key) : undefined

function legacyCredentials(): { identity: Identity; credentials: Credentials } | null {
    const keys = storageKeys() as any
    const accessToken = readKey(keys?.account?.jwt?.token)
    const refreshToken = readKey(keys?.account?.jwt?.refreshToken)
    if (!accessToken || !refreshToken) return null

    const userId = readKey(keys?.user?.id) || decodeSub(accessToken) || ""

    // A geração vem do blob quando ele descreve o mesmo refresh token; se o login gravou
    // credenciais novas por fora, recomeça do zero. A geração só precisa ser monotônica
    // dentro de uma mesma sessão — é usada para comparar requests em voo, não persistida
    // como identidade.
    const persisted = getStore().getSession()
    const generation =
        persisted.state === "active" && persisted.credentials.refreshToken === refreshToken
            ? persisted.credentials.generation
            : 0

    return {
        identity: { userId },
        credentials: {
            accessToken,
            refreshToken,
            generation,
            issuedAt: new Date().toISOString(),
        },
    }
}

/** Espelha a rotação de volta nas chaves antigas — o resto do app ainda lê de lá. */
function mirrorToLegacyKeys(credentials: Credentials): void {
    try {
        const keys = (storageKeys() as any)?.account?.jwt
        if (!keys) return
        storage.set(keys.token, credentials.accessToken)
        storage.set(keys.refreshToken, credentials.refreshToken)
    } catch {
        // noop
    }
}

function clearLegacyKeys(): void {
    try {
        const keys = (storageKeys() as any)?.account?.jwt
        if (!keys) return
        safeDelete(keys.token)
        safeDelete(keys.refreshToken)
        if (keys.expiration) safeDelete(keys.expiration)
    } catch {
        // noop
    }
}

function handleEvent(session: Session, event: SessionEvent): void {
    // O guard de identidade (§6) vive no reducer: um evento de sessão que já não é a
    // corrente não altera o estado. Aqui o bundle é a própria Session.
    getStore().dispatch({ type: "received-session-event", bundle: session, event })

    if (event.type === "update") {
        mirrorToLegacyKeys(event.credentials)
        return
    }

    if (event.type === "expired") {
        if (current === session) current = null
        clearLegacyKeys()
        onExpired?.(event)
    }
}

/**
 * A `Session` corrente, construída sob demanda a partir das credenciais em storage.
 *
 * Reaproveita a instância enquanto ela descrever o **mesmo** refresh token: é o que garante
 * que dois 401 simultâneos compartilhem o single-flight em vez de rodarem duas rotações —
 * que, com token de uso único, revogaria a conta (§13.1).
 *
 * Se o refresh token do storage mudou (login novo, outra sessão), a instância antiga é
 * descartada com `kill()`, e a partir daí ela não consegue mais consumir token nenhum.
 */
export function ensureSession(refreshRequest: RefreshRequest): Session | null {
    const source = legacyCredentials()
    if (!source) {
        if (current) {
            current.kill()
            current = null
        }
        return null
    }

    if (current && !current.isDestroyed) {
        if (current.credentials.refreshToken === source.credentials.refreshToken) return current
        current.kill()
    }

    const session = new Session({
        identity: source.identity,
        credentials: source.credentials,
        refreshRequest,
        hooks: { onEvent: (event) => handleEvent(session, event) },
    })

    current = session

    // Promove a sessão a bundle corrente: sem isso o guard de identidade descartaria todo
    // evento que ela emitisse.
    getStore().dispatch({
        type: "resumed",
        bundle: session,
        identity: source.identity,
        credentials: source.credentials,
        profile: readProfileFromLegacyKeys(),
        status: readStatusFromLegacyKeys(),
    })

    session.arm()
    return session
}

function readProfileFromLegacyKeys() {
    const keys = (storageKeys() as any)?.user
    return {
        username: readKey(keys?.username) || "",
        name: readKey(keys?.name) || undefined,
        profilePicture: readKey(keys?.profilePicture) || undefined,
    }
}

function readBoolean(key: ScopedKey | undefined): boolean {
    try {
        return key ? storage.getBoolean(key) === true : false
    } catch {
        return false
    }
}

function readStatusFromLegacyKeys() {
    const keys = (storageKeys() as any)?.account
    return {
        accessLevel: readKey(keys?.accessLevel) || "",
        verified: readBoolean(keys?.verified),
        blocked: readBoolean(keys?.blocked),
        deleted: readBoolean(keys?.deleted),
    }
}

/**
 * O access token que deve ir no header, e a geração dele.
 *
 * A sessão viva vence o storage: depois de uma rotação, ela já tem o par novo, e é
 * exatamente aqui que morre a corrida de token stale do modelo antigo — em que uma request
 * saía com o token lido do MMKV antes do refresh terminar.
 *
 * O fallback para as chaves legadas existe porque na Fase 3 o login ainda escreve por lá:
 * logo após entrar, ainda não há `Session` construída.
 */
export function currentAuth(): { token: string | undefined; generation: number } {
    if (current && !current.isDestroyed) {
        return { token: current.credentials.accessToken, generation: current.generation }
    }
    return { token: readKey((storageKeys() as any)?.account?.jwt?.token), generation: 0 }
}

/** A sessão viva, sem construir uma nova. */
export function peekSession(): Session | null {
    return current && !current.isDestroyed ? current : null
}

// ── A barreira de revalidação (§5.5) ───────────────────────────────────────────────────
// Guardada aqui, e não em `foreground.ts`, porque o interceptor de request precisa esperá-la
// e não pode importar `react-native` nem NetInfo. Este módulo é neutro; a fiação com o
// `AppState` fica do outro lado.

type Barrier = { wait: () => Promise<void> }
let barrier: Barrier | null = null

export function setBarrier(next: Barrier | null): void {
    barrier = next
}

/**
 * O que o interceptor aguarda antes de deixar a request sair. Sem barreira instalada
 * (testes, boot antes do provider), resolve na hora.
 */
export function waitForRevalidation(): Promise<void> {
    return barrier ? barrier.wait() : Promise.resolve()
}

/**
 * Rotaciona o par usando a sessão viva. Devolve sem fazer nada quando não há sessão — o
 * refresh proativo pode disparar logo depois de um logout.
 *
 * Note que isto NÃO constrói sessão: quem constrói é o caminho do 401, que tem a função de
 * rede em mãos. Aqui só se reaproveita o single-flight de quem já existe.
 */
export async function refreshCurrentSession(): Promise<void> {
    const session = peekSession()
    if (!session) return
    await session.refresh()
}

/**
 * Grava a sessão no blob logo após um login, **com a âncora do Apple**.
 *
 * Sem isto o `appleUserId` nunca chega ao disco: `ensureSession` monta a sessão a partir das
 * chaves legadas, que não o têm, e a rotação só preserva o que já estava lá. O resultado
 * seria uma âncora eternamente ausente — e o guard do §2.6 nunca teria com o que comparar.
 *
 * Chamado depois de as chaves legadas já terem sido escritas pelo login.
 */
export function recordLogin(appleUserId?: string): void {
    const source = legacyCredentials()
    if (!source) return

    // Uma sessão viva de antes do login descreve outra credencial: matá-la aqui evita que
    // ela rotacione um token que já não é o corrente.
    if (current) {
        current.kill()
        current = null
    }

    const identity = appleUserId
        ? { ...source.identity, appleUserId }
        : source.identity

    getStore().dispatch({
        type: "signed-in",
        bundle: {},
        identity,
        credentials: source.credentials,
        profile: readProfileFromLegacyKeys(),
        status: readStatusFromLegacyKeys(),
    })
}

// ── A decisão de tela de entrada (§5.8) ────────────────────────────────────────────────
// Calculada no cold start pelo `RootLayoutNav` e consumida pela tela de autenticação. Fica
// aqui porque atravessa a fronteira de navegação, e passá-la por contexto obrigaria o
// provider de sessão a conhecer o roteador.

type PendingEntryScreen = { kind: string; username?: string; appleUserId?: string }
let pendingEntryScreen: PendingEntryScreen | null = null

export function setPendingEntryScreen(screen: PendingEntryScreen | null): void {
    pendingEntryScreen = screen
}

/** Consumido **uma vez**: depois de a tela ler, a decisão não vale mais — o estado da
 * credencial pode ter mudado, e uma decisão velha ofereceria um atalho que já não existe. */
export function takePendingEntryScreen(): PendingEntryScreen | null {
    const screen = pendingEntryScreen
    pendingEntryScreen = null
    return screen
}

/** Descarta a sessão viva — usado no logout e nos testes. */
export function resetSessionRuntime(): void {
    pendingEntryScreen = null
    current?.kill()
    current = null
    store = null
}

export { readSession, writeSession }
