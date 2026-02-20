import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios"

import config from "@/config"
import { storage, storageKeys, safeDelete } from "@/store"
import { useAccountStore } from "@/contexts/Persisted/persist.account"

import { routes as accountRoutes } from "./account/account"
import { routes as authRoutes } from "./auth/auth"
import { routes as momentRoutes } from "./moment/moment"
import { routes as preferencesRoutes } from "./preferences/preferences"
import { routes as userRoutes } from "./user/user"
import { routes as profileRoutes } from "./profile/profile"

type PendingResolver = (token: string) => void

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
const pendingQueue: PendingResolver[] = []

// Auth grace period: used to delay refresh handling right after auth completes
let authGraceUntil = 0
export function beginAuthGracePeriod(durationMs: number = 1000) {
    authGraceUntil = Date.now() + Math.max(0, durationMs)
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
        // No refresh token available: skip cleanup and signal sentinel error
        console.warn("🔒 Refresh aborted: missing refreshToken in storage")
        throw new Error("NO_REFRESH_TOKEN")
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
    const res = await api.get("/auth/refresh-token", {
        headers: { Authorization: `Bearer ${currentRefresh}` },
    })
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
        throw new Error("Invalid refresh response: token not found")
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

    console.log("🔍 Erro 401 detectado")
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

    console.log("🔄 Tentando refresh token para requisição:", originalRequest.url)

    originalRequest._retry = true

    // Se já existe um refresh em andamento, enfileira a repetição da request
    if (isRefreshing && refreshPromise) {
        console.log(
            "⏳ Refresh in progress - enqueue request",
            JSON.stringify({ url: originalRequest.url, queueSize: pendingQueue.length }),
        )
        return new Promise((resolve, reject) => {
            pendingQueue.push((newToken) => {
                try {
                    console.log(
                        "▶️ Resuming enqueued request",
                        JSON.stringify({
                            url: originalRequest.url,
                            gotTokenPreview: (newToken || "").slice(0, 10),
                        }),
                    )
                    const plainHeaders =
                        originalRequest.headers &&
                        typeof (originalRequest.headers as any).toJSON === "function"
                            ? (originalRequest.headers as any).toJSON()
                            : { ...(originalRequest.headers || {}) }
                    plainHeaders.Authorization = `Bearer ${newToken}`
                    originalRequest.headers = plainHeaders
                    resolve(api(originalRequest))
                } catch (e) {
                    reject(e)
                }
            })
        })
    }

    // Inicia o refresh (single-flight)
    isRefreshing = true
    refreshPromise = doRefreshToken()

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
            const resume = pendingQueue.shift()
            try {
                resume?.(newToken)
            } catch {
                // ignora erros isolados no resume
            }
        }

        // Repetir a request original com o novo token
        const plainHeaders =
            originalRequest.headers && typeof (originalRequest.headers as any).toJSON === "function"
                ? (originalRequest.headers as any).toJSON()
                : { ...(originalRequest.headers || {}) }
        plainHeaders.Authorization = `Bearer ${newToken}`
        originalRequest.headers = plainHeaders
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

        // Falha no refresh: limpa fila (tenta rejeitar como vazio)
        while (pendingQueue.length) {
            const resume = pendingQueue.shift()
            try {
                resume?.("")
            } catch {
                // ignora
            }
        }

        // Limpeza de tokens somente quando o erro não for o sentinela de ausência de refresh token
        if (String((refreshErr as any)?.message) !== "NO_REFRESH_TOKEN") {
            try {
                const jwtKeys = storageKeys().account.jwt
                safeDelete(jwtKeys.token)
                safeDelete(jwtKeys.refreshToken)
                safeDelete(jwtKeys.expiration)
                if (api?.defaults?.headers?.common?.Authorization) {
                    delete api.defaults.headers.common.Authorization
                }
                console.log("🧹 Tokens limpos após falha no refresh")
            } catch {
                // ignore
            }
        } else {
            console.log("🔕 Skipping token cleanup due to NO_REFRESH_TOKEN")
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
}
