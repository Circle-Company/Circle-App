import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios"

import config from "@/config"
import { storage, storageKeys, safeDelete } from "@/store"
import { useAccountStore } from "@/contexts/Persisted/persist.account"

import { routes as accountRoutes } from "./account/account"
import { routes as authRoutes } from "./auth/auth"
import { routes as momentRoutes } from "./moment/moment"
import { routes as preferencesRoutes } from "./preferences/preferences"
import { routes as radarRoutes } from "./radar/radar"
import { routes as userRoutes } from "./user/user"
import { routes as profileRoutes } from "./profile/profile"

/**
 * Request que ficou esperando o refresh terminar. Precisa dos dois lados: em
 * caso de falha ela tem que ser **rejeitada**, não repetida com token vazio.
 */
type PendingEntry = {
    resume: (token: string) => void
    fail: (error: unknown) => void
}

const PATH = `${config.ENDPOINT}`

const api: AxiosInstance = axios.create({
    baseURL: PATH,
})

// -----------------------------
// Request Interceptor
// -----------------------------
api.interceptors.request.use((cfg) => {
    const token = storage.getString(storageKeys().account.jwt.token)

    // Timestamp para medir duração (usado no response interceptor)
    ;(cfg as any).metadata = { start: Date.now() }
    // Garante baseURL em requests reexecutadas (ex.: após refresh)
    cfg.baseURL = cfg.baseURL || PATH

    // Atenção: o app usa o token "cru" no header Authorization (sem "Bearer ")
    // Vários endpoints já passam authorizationToken manualmente.
    // Mantemos o comportamento global como "cru" para não quebrar endpoints existentes.
    if (token) {
        cfg.headers = cfg.headers ?? {}
        const headersAny = cfg.headers as any
        const hasSet = typeof headersAny.set === "function"
        const hasAuthUpper = !!headersAny.Authorization
        const hasAuthLower = !!headersAny.authorization
        if (!hasAuthUpper && !hasAuthLower) {
            if (hasSet) {
                headersAny.set("Authorization", `Bearer ${token}`)
            } else {
                headersAny.Authorization = `Bearer ${token}`
            }
        }
        const preview = token.slice ? token.slice(-10) : ""
        console.log(
            "🧩 Injected Authorization header from storage",
            JSON.stringify({ url: cfg.url || "", preview }),
        )
    }

    // Logs ricos para diagnóstico de WATCH e AUTH
    const url = cfg.url || ""
    const method = (cfg.method || "GET").toUpperCase()
    if (url.includes("/moments/") && url.includes("/watch")) {
        const header = (cfg.headers?.Authorization as string) || token || ""
        const preview = header.slice ? header.slice(0, 10) : ""
        let bodyInfo = ""
        try {
            bodyInfo = JSON.stringify(cfg.data ?? {})
        } catch {
            bodyInfo = "[unserializable]"
        }
        console.log(
            "▶️ WATCH request",
            JSON.stringify({
                method,
                url,
                authHeaderPresent: !!header,
                authPreview: preview,
                body: bodyInfo,
            }),
        )
    } else if (url.includes("/moments/")) {
        const methodUpper = (method || "GET").toUpperCase()
        // Enforce Authorization header for mutating requests to /moments/*
        if (["POST", "PUT", "PATCH", "DELETE"].includes(methodUpper)) {
            if (!cfg.headers) cfg.headers = {}
            const headersAny = cfg.headers as any
            const hasSet = typeof headersAny.set === "function"
            const hasAuthUpper = !!headersAny.Authorization
            const hasAuthLower = !!headersAny.authorization
            if (!hasAuthUpper && !hasAuthLower && token) {
                if (hasSet) {
                    headersAny.set("Authorization", `Bearer ${token}`)
                } else {
                    headersAny.Authorization = `Bearer ${token}`
                }
                const enforcedPreview = token.slice ? token.slice(-10) : ""
                console.log(
                    "🛡️ Enforced Authorization for mutating /moments request",
                    JSON.stringify({ method: methodUpper, url, authPreview: enforcedPreview }),
                )
            }
            if (!(cfg.headers as any).Authorization) {
                console.warn(
                    "⚠️ Missing Authorization for mutating /moments request",
                    JSON.stringify({ method: methodUpper, url }),
                )
            }
        }
        const finalHeader = (cfg.headers?.Authorization as string) || ""
        const preview = finalHeader.slice ? finalHeader.slice(-10) : ""
        console.log(
            "▶️ MOMENTS request",
            JSON.stringify({
                method,
                url,
                authHeaderPresent: !!finalHeader,
                authPreview: preview,
            }),
        )
    }
    if (url.includes("/auth/")) {
        const header = (cfg.headers?.Authorization as string) || token || ""
        const preview = header.slice ? header.slice(0, 10) : ""
        console.log(
            "▶️ AUTH request",
            JSON.stringify({
                method,
                url,
                authHeaderPresent: !!header,
                authPreview: preview,
            }),
        )
    }

    return cfg
})

// -----------------------------
// Refresh Flow (single-flight)
// -----------------------------
let isRefreshing = false
let refreshPromise: Promise<string> | null = null
const pendingQueue: PendingEntry[] = []

/** Teto para a chamada de refresh. Sem isso, um `/auth/refresh-token` pendurado
 * deixa `isRefreshing` ligado para sempre e toda request seguinte entra numa
 * fila que nunca é drenada — o app trava inteiro sem erro nenhum. */
const REFRESH_TIMEOUT_MS = 15_000

/**
 * Devolve os headers da request com o Authorization trocado. Os headers do
 * axios podem ser um `AxiosHeaders` (com `toJSON`) ou um objeto simples,
 * dependendo de como a request foi criada — daí a normalização.
 */
/** Rejeita a promise se ela não resolver dentro do prazo. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Refresh timeout após ${ms}ms`)), ms)
        promise.then(
            (value) => {
                clearTimeout(timer)
                resolve(value)
            },
            (error) => {
                clearTimeout(timer)
                reject(error)
            },
        )
    })
}

function withAuthorization(headers: unknown, token: string) {
    const plain =
        headers && typeof (headers as any).toJSON === "function"
            ? (headers as any).toJSON()
            : { ...((headers as Record<string, unknown>) || {}) }
    plain.Authorization = `Bearer ${token}`
    return plain
}

// Auth grace period: used to delay refresh handling right after auth completes
let authGraceUntil = 0
export function beginAuthGracePeriod(durationMs: number = 1000) {
    authGraceUntil = Date.now() + Math.max(0, durationMs)
}

/**
 * Sessão irrecuperável: recebemos 401 e não há como renovar o token.
 * Diferente de um erro de rede no refresh, aqui não adianta tentar de novo —
 * o app precisa deslogar e voltar para a tela de autenticação.
 */
export class SessionExpiredError extends Error {
    constructor(public readonly reason: "NO_REFRESH_TOKEN" | "REFRESH_REJECTED") {
        super(`SESSION_EXPIRED: ${reason}`)
        this.name = "SessionExpiredError"
    }
}

type SessionExpiredHandler = () => void
const sessionExpiredHandlers = new Set<SessionExpiredHandler>()

/**
 * Registra um handler para quando a sessão morre. A camada de axios não tem
 * acesso a hooks nem ao router, então o AuthProvider se inscreve aqui e chama
 * `signOut()` — é isso que tira o app do limbo "logado sem token".
 */
export function onSessionExpired(handler: SessionExpiredHandler): () => void {
    sessionExpiredHandlers.add(handler)
    return () => sessionExpiredHandlers.delete(handler)
}

// Um 401 costuma chegar em rajada (várias queries em paralelo). Sem esta trava
// cada uma dispararia um signOut.
let sessionExpiredNotified = false

function notifySessionExpired() {
    if (sessionExpiredNotified) return
    sessionExpiredNotified = true
    console.warn("🚪 Sessão expirada — solicitando signOut")
    sessionExpiredHandlers.forEach((handler) => {
        try {
            handler()
        } catch (e) {
            console.warn("Erro em handler de sessão expirada:", e)
        }
    })
}

/** Chamado após um login bem-sucedido para rearmar a notificação. */
export function resetSessionExpiredLatch() {
    sessionExpiredNotified = false
}

/**
 * Dispara o refresh token flow usando o refreshToken salvo no MMKV.
 * - GET /auth/refresh-token (Authorization: Bearer <refreshToken>)
 * - Retorna o novo JWT (e possivelmente um novo refreshToken)
 * - Persiste no MMKV e reflete no Zustand sem hooks
 */
async function doRefreshToken(): Promise<string> {
    const jwtKeys = storageKeys().account.jwt
    const currentRefresh = storage.getString(jwtKeys.refreshToken)

    if (!currentRefresh) {
        // Sem refresh token não há como recuperar: o 401 já provou que o access
        // token não serve. Antes isto lançava um sentinela que o handler tratava
        // como transitório e ignorava — o app seguia "logado" sem token nenhum,
        // todo request dava 401, nenhuma tela montava e o usuário ficava preso
        // numa tela preta. Agora é terminal e leva a signOut.
        console.warn("🔒 Refresh impossível: refreshToken ausente no storage")
        throw new SessionExpiredError("NO_REFRESH_TOKEN")
    }

    // Chama a rota de refresh enviando Authorization com o refresh token "cru" (sem Bearer)
    // Usamos a própria instância `api`, e o response interceptor ignora essa rota.
    const refreshStartTs = Date.now()
    const refreshHeaderPreview = (currentRefresh || "").slice(0, 10)
    console.log(
        "🔄 Refresh start",
        JSON.stringify({
            url: "/auth/refresh-token",
            headerPreview: refreshHeaderPreview,
            ts: refreshStartTs,
        }),
    )
    let res
    try {
        res = await api.get("/auth/refresh-token", {
            headers: { Authorization: `Bearer ${currentRefresh}` },
        })
    } catch (err) {
        // 401/403 na própria rota de refresh = o refresh token não vale mais.
        // Qualquer outra coisa (rede, 5xx) é transitória e deve preservar os
        // tokens para a próxima tentativa.
        const status = (err as AxiosError)?.response?.status
        if (status === 401 || status === 403) {
            console.warn("🔒 Refresh token rejeitado pelo backend", JSON.stringify({ status }))
            throw new SessionExpiredError("REFRESH_REJECTED")
        }
        throw err
    }

    const refreshDurationMs = Date.now() - refreshStartTs
    console.log(
        "✅ Refresh success",
        JSON.stringify({ durationMs: refreshDurationMs, status: res?.status }),
    )
    // Backend retorna { success, token, refreshToken, expiresIn, refreshExpiresIn, user }
    const newToken: string | undefined = res.data?.token
    const newRefresh: string | undefined = res.data?.refreshToken
    const expiresIn: number | undefined = res.data?.expiresIn

    if (!newToken) {
        // Resposta 200 sem token é resposta inválida — não há o que reter.
        throw new SessionExpiredError("REFRESH_REJECTED")
    }

    // Persistir no MMKV
    storage.set(jwtKeys.token, newToken)
    if (newRefresh) storage.set(jwtKeys.refreshToken, newRefresh)

    if (typeof expiresIn === "number" && expiresIn > 0) {
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
        storage.set(jwtKeys.expiration, expiresAt)
    }

    // Atualizar defaults
    api.defaults.headers.common = api.defaults.headers.common || {}
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`

    // Refletir no Zustand (sem hooks)
    try {
        const account = useAccountStore.getState()
        account.set({
            ...account,
            jwtToken: newToken,
            refreshToken: newRefresh ?? account.refreshToken,
            // Mantém a expiração atual se não enviada
            jwtExpiration:
                typeof expiresIn === "number" && expiresIn > 0
                    ? new Date(Date.now() + expiresIn * 1000).toISOString()
                    : (account as any).jwtExpiration,
        } as any)
    } catch {
        // manter silencioso para não quebrar em ambiente sem Zustand inicializado
    }

    return newToken
}

/**
 * Ao receber 401 (exceto rota de refresh), executa o refresh com single-flight uma vez por request:
 * - Se já estiver refrescando, enfileira a request para repetir após conclusão.
 * - Se não, inicia o refresh, atualiza os tokens e re-executa a request original.
 */
async function handleAuthError(error: AxiosError) {
    const response = error.response
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = (error.config || {}) as any

    if (!response) {
        throw error
    }

    const responseCode = (response.data as any)?.code
    const isRefreshRoute = (originalRequest.url || "").includes("/auth/refresh-token")

    console.log("🔍 Erro auth detectado")
    console.log("  Status:", response.status)
    console.log("  Code:", responseCode)
    console.log("  URL:", originalRequest.url)
    let safeData = ""
    try {
        safeData = JSON.stringify(response.data)
    } catch {
        safeData = "[unserializable]"
    }
    console.log("  Response data:", safeData)
    console.log("  Is retry:", originalRequest._retry)
    console.log("  Is refresh route:", isRefreshRoute)

    if (response.status !== 401) {
        console.log("❌ Erro não-401, repassando erro")
        throw error
    }

    // Auth grace: delay handling 401/refresh just after auth completes
    const now = Date.now()
    if (now < authGraceUntil && response.status === 401) {
        const ms = authGraceUntil - now
        console.log("⏳ Auth grace period active, delaying retry by", ms, "ms")
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    resolve(api(originalRequest))
                } catch (e) {
                    resolve(Promise.reject(e))
                }
            }, ms)
        })
    }

    const isRefreshable = response.status === 401 && !originalRequest._retry && !isRefreshRoute

    if (!isRefreshable) {
        console.log("❌ Erro 401 não é refrescável, repassando erro")
        throw error
    }

    // Sem nenhuma credencial no storage não há sessão a recuperar: 401 aqui
    // significa que o app está montado numa rota autenticada sem estar logado.
    // Avisa na hora em vez de tentar um refresh que fatalmente falharia.
    const jwtKeys = storageKeys().account.jwt
    if (!storage.getString(jwtKeys.token) && !storage.getString(jwtKeys.refreshToken)) {
        console.warn("🔒 401 sem token nem refreshToken — sessão inexistente")
        notifySessionExpired()
        throw error
    }

    console.log("🔄 Tentando refresh token para requisição:", originalRequest.url)

    originalRequest._retry = true

    // Se já existe um refresh em andamento, enfileira a repetição da request
    if (isRefreshing && refreshPromise) {
        console.log(
            "⏳ Refresh in progress - enqueue request",
            JSON.stringify({ url: originalRequest.url, queueSize: pendingQueue.length }),
        )
        return new Promise((resolve, reject) => {
            pendingQueue.push({
                resume: (newToken) => {
                    try {
                        console.log(
                            "▶️ Resuming enqueued request",
                            JSON.stringify({
                                url: originalRequest.url,
                                gotTokenPreview: (newToken || "").slice(0, 10),
                            }),
                        )
                        originalRequest.headers = withAuthorization(
                            originalRequest.headers,
                            newToken,
                        )
                        resolve(api(originalRequest))
                    } catch (e) {
                        reject(e)
                    }
                },
                fail: reject,
            })
        })
    }

    // Inicia o refresh (single-flight), com teto de tempo
    isRefreshing = true
    refreshPromise = withTimeout(doRefreshToken(), REFRESH_TIMEOUT_MS)

    try {
        const newToken = await refreshPromise
        console.log(
            "✅ Refresh done - resuming queued requests",
            JSON.stringify({
                queued: pendingQueue.length,
                tokenPreview: (newToken || "").slice(0, 10),
            }),
        )

        // Desenfileira e repete todas requests pendentes
        while (pendingQueue.length) {
            const entry = pendingQueue.shift()
            try {
                entry?.resume(newToken)
            } catch {
                // ignora erros isolados no resume
            }
        }

        // Repetir a request original com o novo token
        originalRequest.headers = withAuthorization(originalRequest.headers, newToken)
        console.log(
            "🔄 Retrying original request with new token",
            JSON.stringify({
                url: originalRequest.url,
                tokenPreview: (newToken || "").slice(0, 10),
            }),
        )
        return api(originalRequest)
    } catch (refreshErr) {
        console.error("❌ Falha no refresh token:", refreshErr)

        // Rejeita as requests em espera. Antes elas eram reenviadas com
        // `Bearer ` vazio, o que só gerava outra rodada de 401 e escondia a
        // causa real atrás de um erro genérico.
        while (pendingQueue.length) {
            const entry = pendingQueue.shift()
            try {
                entry?.fail(refreshErr)
            } catch {
                // ignora
            }
        }

        // Erro de rede/5xx no refresh é transitório: mantém os tokens para a
        // próxima tentativa. Sessão expirada é terminal: limpa e desloga.
        const isTerminal = refreshErr instanceof SessionExpiredError

        if (isTerminal) {
            try {
                const jwtKeys = storageKeys().account.jwt
                safeDelete(jwtKeys.token)
                safeDelete(jwtKeys.refreshToken)
                safeDelete(jwtKeys.expiration)
                if (api?.defaults?.headers?.common?.Authorization) {
                    delete api.defaults.headers.common.Authorization
                }
                console.log("🧹 Tokens limpos após sessão expirada")
            } catch {
                // ignore
            }
            notifySessionExpired()
        } else {
            console.log("🔁 Falha transitória no refresh — tokens preservados")
        }

        throw refreshErr
    } finally {
        isRefreshing = false
        refreshPromise = null
    }
}

// -----------------------------
// Response Interceptor
// -----------------------------
api.interceptors.response.use(
    (res) => {
        try {
            const url = res.config?.url || ""
            const method = res.config?.method?.toUpperCase?.() || ""
            const status = res.status
            const start = (res.config as any)?.metadata?.start
            const durationMs = typeof start === "number" ? Date.now() - start : undefined

            if (url.includes("/moments/") && url.includes("/watch")) {
                console.log(
                    "◀️ WATCH response",
                    JSON.stringify({ method, url, status, durationMs }),
                )
            } else if (url.includes("/moments/")) {
                console.log(
                    "◀️ MOMENTS response",
                    JSON.stringify({ method, url, status, durationMs }),
                )
            } else if (url.includes("/auth/")) {
                console.log("◀️ AUTH response", JSON.stringify({ method, url, status, durationMs }))
            }
        } catch {}
        return res
    },
    (error) => handleAuthError(error),
)

// -----------------------------
// Exports (compat)
// -----------------------------
export default api
export const API = api

export const apiRoutes = {
    account: accountRoutes,
    moment: momentRoutes,
    user: userRoutes,
    preferences: preferencesRoutes,
    auth: authRoutes,
    profile: profileRoutes,
    radar: radarRoutes,
}
