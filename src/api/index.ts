import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios"

import config from "@/config"
import { storage, storageKeys, safeDelete } from "@/store"
import { useAccountStore } from "@/contexts/Persisted/persist.account"

import { routes as accountRoutes } from "./account/account"
import { routes as authRoutes } from "./auth/auth"
import { routes as momentRoutes } from "./moment/moment"
import { routes as preferencesRoutes } from "./preferences/preferences"
import { routes as userRoutes } from "./user/user"

type PendingResolver = (token: string) => void

const PATH = `http://${config.ENDPOINT}`

const api: AxiosInstance = axios.create({
    baseURL: PATH,
})

// -----------------------------
// Request Interceptor
// -----------------------------
api.interceptors.request.use((cfg) => {
    const token = storage.getString(storageKeys().account.jwt.token)

    // Atenção: o app usa o token "cru" no header Authorization (sem "Bearer ")
    // Vários endpoints já passam authorizationToken manualmente.
    // Mantemos o comportamento global como "cru" para não quebrar endpoints existentes.
    if (token) {
        cfg.headers = cfg.headers ?? {}
        if (!cfg.headers.Authorization) {
            cfg.headers.Authorization = token
        }
    }
    return cfg
})

// -----------------------------
// Refresh Flow (single-flight)
// -----------------------------
let isRefreshing = false
let refreshPromise: Promise<string> | null = null
const pendingQueue: PendingResolver[] = []

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
        throw new Error("Missing refreshToken")
    }

    // Chamamos a rota de refresh com Authorization: Bearer <refreshToken>
    // Usamos a própria instância `api`, mas o response interceptor ignora essa rota.
    const res = await api.get("/auth/refresh-token", {
        headers: { Authorization: `${currentRefresh}` },
    })
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
    api.defaults.headers.Authorization = newToken

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
 * Ao receber um 401 com code VAL_1001, executa o refresh com single-flight:
 * - Se já estiver refrescando, enfileira a request para repetir após conclusão.
 * - Se não, inicia o refresh, atualiza os tokens e re-executa a request original.
 */
async function handleAuthError(error: AxiosError) {
    const response = error.response
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = (error.config || {}) as any

    if (!response) {
        throw error
    }

    const isRefreshable =
        response.status === 401 &&
        (response.data as any)?.code === "VAL_1001" &&
        !originalRequest._retry &&
        !(originalRequest.url || "").includes("/auth/refresh-token")

    if (!isRefreshable) {
        throw error
    }

    originalRequest._retry = true

    // Se já existe um refresh em andamento, enfileira a repetição da request
    if (isRefreshing && refreshPromise) {
        return new Promise((resolve, reject) => {
            pendingQueue.push((newToken) => {
                try {
                    originalRequest.headers = originalRequest.headers ?? {}
                    originalRequest.headers.Authorization = newToken
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
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = newToken
        return api(originalRequest)
    } catch (refreshErr) {
        // Falha no refresh: limpa fila (tenta rejeitar como vazio)
        while (pendingQueue.length) {
            const resume = pendingQueue.shift()
            try {
                resume?.("")
            } catch {
                // ignora
            }
        }

        // Limpar tokens no MMKV — o app detectará não autenticado depois
        try {
            const jwtKeys = storageKeys().account.jwt
            safeDelete(jwtKeys.token)
            safeDelete(jwtKeys.refreshToken)
            safeDelete(jwtKeys.expiration)
        } catch {
            // ignore
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
    (res) => res,
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
}
