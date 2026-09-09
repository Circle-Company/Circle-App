import { Credentials, Identity } from "./schema"
import {
    REFRESH_TIMEOUT_MS,
    RefreshTimeoutError,
    RefreshVerdict,
    classifyRefreshError,
} from "./verdict"

/**
 * O dono dos tokens. Ver `docs/session-management.md` §3.1.
 *
 * Hoje esse papel não existe: o estado do refresh mora em variáveis de módulo do
 * interceptor (`isRefreshing`, `refreshPromise`, `pendingQueue`), o que amarra o refresh a
 * **uma** instância global e impede que duas sessões coexistam. Com o refresh token sendo
 * de uso único e com detecção de reuso (§13.1), duas sessões disputando o mesmo token não
 * é um detalhe de arquitetura: é a conta do usuário sendo revogada.
 */

/** O corpo de `GET /auth/refresh-token` em caso de sucesso. */
export type RefreshResponse = {
    token?: string
    refreshToken?: string
    expiresIn?: number
}

/** Faz a chamada de rede. Injetado para a `Session` não conhecer o axios — quem amarra o
 * client à sessão é a Fase 3. */
export type RefreshRequest = (refreshToken: string) => Promise<RefreshResponse>

export type SessionEvent =
    | { type: "update"; credentials: Credentials }
    | { type: "network-error"; verdict: RefreshVerdict }
    | { type: "expired"; verdict: RefreshVerdict }

export type SessionHooks = {
    onEvent: (event: SessionEvent) => void
}

export type SessionOptions = {
    identity: Identity
    credentials: Credentials
    refreshRequest: RefreshRequest
    hooks?: SessionHooks
    timeoutMs?: number
    /** Injetável para teste; por padrão `setTimeout`. */
    scheduleTimeout?: (fn: () => void, ms: number) => { cancel: () => void }
}

export class SessionDestroyedError extends Error {
    constructor() {
        super("Sessão descartada")
        this.name = "SessionDestroyedError"
    }
}

export class NoRefreshTokenError extends Error {
    constructor() {
        super("Sem refresh token")
        this.name = "NoRefreshTokenError"
    }
}

const defaultScheduleTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    return { cancel: () => clearTimeout(id) }
}

export class Session {
    private identityValue: Identity
    private credentialsValue: Credentials
    private readonly refreshRequest: RefreshRequest
    private readonly timeoutMs: number
    private readonly scheduleTimeout: NonNullable<SessionOptions["scheduleTimeout"]>

    private hooks: SessionHooks | undefined
    /** Latch: os hooks só disparam depois de `arm()`. Ver §3.1, ponto 4. */
    private armed = false
    private destroyed = false
    private refreshInFlight: Promise<Credentials> | null = null

    constructor(options: SessionOptions) {
        this.identityValue = options.identity
        this.credentialsValue = options.credentials
        this.refreshRequest = options.refreshRequest
        this.hooks = options.hooks
        this.timeoutMs = options.timeoutMs ?? REFRESH_TIMEOUT_MS
        this.scheduleTimeout = options.scheduleTimeout ?? defaultScheduleTimeout
    }

    get identity(): Identity {
        return this.identityValue
    }

    get credentials(): Credentials {
        return this.credentialsValue
    }

    get accessToken(): string {
        if (this.destroyed) throw new SessionDestroyedError()
        return this.credentialsValue.accessToken
    }

    /** Comparada pelo interceptor para decidir entre "repetir" e "renovar" (§5.4). */
    get generation(): number {
        return this.credentialsValue.generation
    }

    get isDestroyed(): boolean {
        return this.destroyed
    }

    get isRefreshing(): boolean {
        return this.refreshInFlight !== null
    }

    /** A partir daqui os eventos chegam ao store. Ver §3.1, ponto 4. */
    arm(): void {
        this.armed = true
    }

    /**
     * Desarma a sessão. Uma sessão morta **nunca** roda refresh — é o que impede um bundle
     * obsoleto de consumir o refresh token da sessão viva.
     */
    kill(): void {
        this.destroyed = true
        this.armed = false
        this.hooks = undefined
        this.refreshInFlight = null
    }

    /**
     * Rotaciona o par. **Single-flight desta sessão**: N chamadas concorrentes compartilham
     * a mesma promise e produzem **uma** request. É a defesa central contra a detecção de
     * reuso do backend — cinco refreshes paralelos com o mesmo token revogam a conta.
     */
    refresh(): Promise<Credentials> {
        if (this.destroyed) return Promise.reject(new SessionDestroyedError())
        if (this.refreshInFlight) return this.refreshInFlight

        this.refreshInFlight = this.performRefresh().finally(() => {
            this.refreshInFlight = null
        })
        return this.refreshInFlight
    }

    private async performRefresh(): Promise<Credentials> {
        const currentRefresh = this.credentialsValue.refreshToken
        if (!currentRefresh) {
            const verdict: RefreshVerdict = { kind: "terminal", reason: "NO_REFRESH_TOKEN" }
            this.destroyed = true
            this.dispatch({ type: "expired", verdict })
            throw new NoRefreshTokenError()
        }

        let response: RefreshResponse
        try {
            response = await this.withTimeout(this.refreshRequest(currentRefresh))
        } catch (error) {
            const verdict = classifyRefreshError(error)

            if (verdict.kind === "terminal") {
                // A sessão morreu de verdade. Marcar antes de despachar evita que um
                // handler reentrante tente refrescar de novo com um token já queimado.
                this.destroyed = true
                this.dispatch({ type: "expired", verdict })
            } else {
                // Transitório e desconhecido preservam os tokens. O "desconhecido" não pode
                // virar outro refresh às cegas — quem decide o próximo passo é o chamador.
                this.dispatch({ type: "network-error", verdict })
            }

            throw error
        }

        // Uma resposta 200 sem token não deixa nada a reter, e o token que mandamos já foi
        // consumido no servidor. É tão terminal quanto um 401.
        if (!response?.token || !response?.refreshToken) {
            const verdict: RefreshVerdict = { kind: "terminal", reason: "MALFORMED_RESPONSE" }
            this.destroyed = true
            this.dispatch({ type: "expired", verdict })
            throw new Error("Resposta de refresh sem o par de tokens")
        }

        // O par é substituído de uma vez: nunca existe um instante com access novo e
        // refresh velho. É o §2.3/P1 valendo dentro da memória, não só no storage.
        const credentials: Credentials = {
            accessToken: response.token,
            refreshToken: response.refreshToken,
            generation: this.credentialsValue.generation + 1,
            issuedAt: new Date().toISOString(),
        }
        this.credentialsValue = credentials

        this.dispatch({ type: "update", credentials })
        return credentials
    }

    /**
     * Rejeita se a request não resolver a tempo — mas **não** cancela a chamada HTTP. É
     * exatamente por isso que o resultado disso é "desconhecido" e não "falhou": o servidor
     * pode ter processado a rotação mesmo assim (§0.1c).
     */
    private withTimeout<T>(promise: Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timer = this.scheduleTimeout(
                () => reject(new RefreshTimeoutError(this.timeoutMs)),
                this.timeoutMs,
            )
            promise.then(
                (value) => {
                    timer.cancel()
                    resolve(value)
                },
                (error) => {
                    timer.cancel()
                    reject(error)
                },
            )
        })
    }

    /**
     * Um hook **nunca** pode derrubar o refresh. Sem este try/catch, um throw síncrono do
     * handler deixaria a promise interna rejeitada para sempre: toda request futura
     * falharia, e como a sessão nunca seria marcada como morta, nem o descarte perceberia.
     */
    private dispatch(event: SessionEvent): void {
        if (!this.armed || !this.hooks) return
        try {
            this.hooks.onEvent(event)
        } catch (error) {
            console.warn("Hook de sessão lançou; ignorado", error)
        }
    }
}
