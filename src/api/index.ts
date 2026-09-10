import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios"

import config from "@/config"
import { storage, storageKeys, safeDelete } from "@/store"
import { currentAuth, ensureSession, peekSession, waitForRevalidation } from "@/session/runtime"

import { routes as accountRoutes } from "./account/account"
import { routes as authRoutes } from "./auth/auth"
import { routes as chatRoutes } from "./chat/chat"
import { routes as friendshipRoutes } from "./friendship/friendship"
import { routes as momentRoutes } from "./moment/moment"
import { routes as preferencesRoutes } from "./preferences/preferences"
import { routes as radarRoutes } from "./radar/radar"
import { routes as userRoutes } from "./user/user"
import { routes as profileRoutes } from "./profile/profile"

/** Teto de tentativas de auth por request. Ver §5.4: contador, não booleano. */
const MAX_AUTH_ATTEMPTS = 2

const PATH = `${config.ENDPOINT}`

const api: AxiosInstance = axios.create({
    baseURL: PATH,
})

/**
 * Log de diagnóstico. Duas regras, ambas não negociáveis (ver `docs/session-management.md`
 * §8): só sai em desenvolvimento, e **nenhum payload pode conter fragmento de token** —
 * nem prefixo nem sufixo. Presença é booleano; o valor nunca aparece.
 */
const devLog = (message: string, data?: Record<string, unknown>) => {
    if (!__DEV__) return
    if (data) console.log(message, JSON.stringify(data))
    else console.log(message)
}

/**
 * Escreve o header Authorization, respeitando as duas formas que o axios usa (`AxiosHeaders`
 * com `set`, ou objeto simples).
 *
 * **Sobrescreve um header já presente**, e isso é o ponto. Dezenas de chamadas no app ainda
 * passam `session.account.userId` à mão, lido do Zustand — que pode estar defasado em
 * relação à sessão viva logo após uma rotação. Como antes o interceptor só preenchia quando
 * o header faltava, o token stale **vencia** o fresco: a mesma corrida que o §3.2 fecha,
 * reaberta pela porta dos fundos. Agora quem manda é sempre a sessão.
 *
 * A exceção é quem legitimamente carrega outra credencial: o refresh (que manda o **refresh
 * token**) e o signout (que manda um access token capturado antes da limpeza). Esses marcam
 * `ownAuth` e passam intactos.
 */
function applyAuthHeader(cfg: { headers?: unknown }, token: string): void {
    const headers = (cfg.headers ?? (cfg.headers = {})) as any
    if (typeof headers.set === "function") headers.set("Authorization", `Bearer ${token}`)
    else headers.Authorization = `Bearer ${token}`
}

// -----------------------------
// Request Interceptor
// -----------------------------
api.interceptors.request.use(async (cfg) => {
    // ── A barreira de revalidação (§5.5) ──────────────────────────────────────────────
    // Na volta do background, as requests esperam aqui em vez de sair com um token morto e
    // voltar 401. A rajada de 401 deixa de existir em vez de ser tratada depois.
    //
    // A rota de refresh é isenta, e isso não é detalhe: é a própria revalidação que abre a
    // barreira, então fazê-la esperar seria ela esperar por si mesma — deadlock com o app
    // inteiro travado sem erro nenhum.
    if (!(cfg.url || "").includes("/auth/refresh-token")) {
        await waitForRevalidation()
    }

    // O token vem da SESSÃO VIVA, não do MMKV. É o que fecha a corrida de token stale:
    // antes, uma request podia sair com o token lido do storage antes de o refresh
    // terminar de gravar o novo. Lido DEPOIS da barreira, de propósito: se houve rotação
    // durante a espera, esta request já sai com o par novo.
    const { token, generation } = currentAuth()

    // Timestamp para medir duração (usado no response interceptor)
    ;(cfg as any).metadata = { start: Date.now() }
    // A geração usada por esta request. No 401, é ela que distingue "o token morreu" de
    // "esta request saiu antes da rotação e só precisa ser repetida" (§5.4).
    ;(cfg as any).tokenGeneration = generation
    // Garante baseURL em requests reexecutadas (ex.: após refresh)
    cfg.baseURL = cfg.baseURL || PATH

    // `ownAuth` marca as requests que carregam outra credencial de propósito.
    if (token && !(cfg as any).ownAuth) applyAuthHeader(cfg, token)

    const url = cfg.url || ""
    const method = (cfg.method || "GET").toUpperCase()
    const authHeaderPresent = !!(
        (cfg.headers as any)?.Authorization || (cfg.headers as any)?.authorization
    )

    if (url.includes("/moments/")) {
        // Mutação em /moments/* sem Authorization é sintoma de sessão em estado
        // inconsistente — vale um aviso mesmo fora de desenvolvimento.
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !authHeaderPresent) {
            console.warn(
                "⚠️ Missing Authorization for mutating /moments request",
                JSON.stringify({ method, url }),
            )
        }
        devLog("▶️ MOMENTS request", { method, url, authHeaderPresent })
    } else if (url.includes("/auth/")) {
        devLog("▶️ AUTH request", { method, url, authHeaderPresent })
    }

    return cfg
})

// -----------------------------
// Refresh Flow
// -----------------------------
// O estado do refresh (`isRefreshing`, `refreshPromise`, `pendingQueue`) saiu daqui: ele
// vive dentro da `Session`, que é a dona dos tokens. A fila de requests pendentes era uma
// reimplementação manual de compartilhamento de promise — `session.refresh()` já devolve a
// mesma promise para todos os chamadores concorrentes, então a fila deixou de existir.

/**
 * Devolve os headers da request com o Authorization trocado. Os headers do
 * axios podem ser um `AxiosHeaders` (com `toJSON`) ou um objeto simples,
 * dependendo de como a request foi criada — daí a normalização.
 */
function withAuthorization(headers: unknown, token: string) {
    const plain =
        headers && typeof (headers as any).toJSON === "function"
            ? (headers as any).toJSON()
            : { ...((headers as Record<string, unknown>) || {}) }
    plain.Authorization = `Bearer ${token}`
    return plain
}

// O `beginAuthGracePeriod` foi removido. Ele existia para suprimir a rajada de 401 logo
// após o login, causada pela janela entre "login respondeu" e "token chegou no MMKV". Com o
// interceptor lendo a sessão viva em vez do storage, a janela não existe mais — e adiar um
// 401 por um segundo escondia o sintoma sem tratar a causa.

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
 * Delega o refresh para a `Session` (`src/session/`), que é a dona dos tokens.
 *
 * O single-flight **não mora mais aqui**: quem o garante é a própria sessão, e é ela quem
 * decide se uma falha foi terminal, transitória ou desconhecida (§5.6). Este wrapper faz
 * só a ponte da Fase 2 — reflete o par novo no Zustand, que ainda é lido pelo resto do app.
 *
 * Com refresh token de uso único e detecção de reuso (§13.1), duas rotações concorrentes
 * revogam a conta do usuário. Por isso o compartilhamento da promise é uma garantia da
 * `Session`, não uma fila reimplementada em cada camada.
 */
async function doRefreshToken(): Promise<string> {
    const session = ensureSession(async (refreshToken) => {
        devLog("🔄 Refresh start", { url: "/auth/refresh-token" })
        const started = Date.now()

        // Atenção: aqui o header carrega o REFRESH token, não o access. O interceptor de
        // request só injeta quando não há Authorization — por isso este explícito vence.
        const res = await api.get("/auth/refresh-token", {
            headers: { Authorization: `Bearer ${refreshToken}` },
            // Sem isto o interceptor sobrescreveria com o ACCESS token, e o refresh
            // falharia com 401 sem que ninguém entendesse por quê.
            ownAuth: true,
        } as any)

        devLog("✅ Refresh success", {
            durationMs: Date.now() - started,
            status: res?.status,
            rotated: !!res.data?.refreshToken,
        })
        return res.data
    })

    if (!session) {
        // Sem credenciais em storage não há sessão a recuperar. Antes isto lançava um
        // sentinela que o handler tratava como transitório e ignorava — o app seguia
        // "logado" sem token nenhum, todo request dava 401 e a tela ficava preta.
        devLog("🔒 Refresh impossível: sem credenciais no storage")
        throw new SessionExpiredError("NO_REFRESH_TOKEN")
    }

    let credentials
    try {
        credentials = await session.refresh()
    } catch (error) {
        // A sessão se marca como destruída **apenas** no veredito terminal (§5.6). Falha
        // transitória ou desconhecida a deixa viva, e o erro sobe como está — preservando
        // os tokens para a próxima tentativa.
        if (session.isDestroyed) throw new SessionExpiredError("REFRESH_REJECTED")
        throw error
    }

    // Antes daqui havia um espelho dos tokens no Zustand. Ele sumiu junto com a fusão das
    // stores (§11.2): o viewer guarda o usuário, não credencial. Os tokens têm **um** dono,
    // a `Session`, que já os persistiu — e era exatamente a existência de vários donos que
    // permitia duas escritas concorrentes ressuscitarem um token invalidado (item 1 do §0).
    return credentials.accessToken
}

/**
 * Ao receber 401 (exceto rota de refresh), executa o refresh com single-flight uma vez por request:
 * - Se já estiver refrescando, enfileira a request para repetir após conclusão.
 * - Se não, inicia o refresh, atualiza os tokens e re-executa a request original.
 */
async function handleAuthError(error: AxiosError) {
    const response = error.response
    const originalRequest: AxiosRequestConfig & {
        authAttempts?: number
        tokenGeneration?: number
    } = (error.config || {}) as any

    if (!response) {
        throw error
    }

    const responseCode = (response.data as any)?.code
    const isRefreshRoute = (originalRequest.url || "").includes("/auth/refresh-token")

    // O corpo da resposta NÃO é logado: é texto livre vindo do servidor, e o §8 exige que
    // nenhum payload de log seja sequer capaz de carregar um token. Só o `code`.
    devLog("🔍 Erro auth detectado", {
        status: response.status,
        code: responseCode,
        url: originalRequest.url,
        authAttempts: originalRequest.authAttempts ?? 0,
        isRefreshRoute,
    })

    if (response.status !== 401) {
        throw error
    }

    // ── O 401 que não precisa de refresh (§5.4) ───────────────────────────────────────
    // Se já rotacionamos desde que esta request saiu, ela morreu com um token velho: não
    // há nada a renovar, só a repetir. Sem isto, um 401 atrasado de uma request pré-refresh
    // dispararia uma rotação inteiramente desnecessária — e, com refresh token de uso único,
    // uma rotação a mais é uma rotação que pode se perder.
    const live = peekSession()
    const requestGeneration = (originalRequest as any).tokenGeneration ?? 0
    if (live && !isRefreshRoute && requestGeneration < live.generation) {
        devLog("♻️ 401 de geração antiga: repetindo sem refrescar", {
            url: originalRequest.url,
            requestGeneration,
            currentGeneration: live.generation,
        })
        originalRequest.headers = withAuthorization(originalRequest.headers, live.accessToken)
        return api(originalRequest)
    }

    // O booleano `_retry` de antes gastava a única chance da request numa falha
    // transitória — e era por isso que, depois de um refresh frustrado por rede, todas as
    // telas ficavam em erro (§0.1a). Agora é contador, e só o 401 comprovadamente corrente
    // consome tentativa.
    const attempts = ((originalRequest as any).authAttempts ?? 0) as number
    const isRefreshable = response.status === 401 && attempts < MAX_AUTH_ATTEMPTS && !isRefreshRoute

    if (!isRefreshable) {
        devLog("❌ 401 não refrescável, repassando erro", { url: originalRequest.url, attempts })
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

    devLog("🔄 Tentando refresh token", { url: originalRequest.url })

    // Sem fila: todas as requests que caíram em 401 ao mesmo tempo aguardam a MESMA
    // promise de `session.refresh()`, e cada uma se repete com o token que sair de lá.
    try {
        const newToken = await doRefreshToken()

        // Só consome tentativa quando o refresh de fato aconteceu: uma falha transitória
        // não pode gastar a chance da request.
        ;(originalRequest as any).authAttempts = attempts + 1

        originalRequest.headers = withAuthorization(originalRequest.headers, newToken)
        devLog("🔄 Repetindo request original com o token novo", { url: originalRequest.url })
        return api(originalRequest)
    } catch (refreshErr) {
        console.error("❌ Falha no refresh token:", refreshErr)

        // Erro de rede/5xx no refresh é transitório: mantém os tokens para a
        // próxima tentativa. Sessão expirada é terminal: limpa e desloga.
        // A classificação real vive em `src/session/verdict.ts`; aqui só resta reagir ao
        // que a sessão já decidiu — ela mata a si mesma no caso terminal.
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
                devLog("🧹 Tokens limpos após sessão expirada")
            } catch {
                // ignore
            }
            notifySessionExpired()
        } else {
            devLog("🔁 Falha transitória no refresh — tokens preservados")
        }

        throw refreshErr
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

            if (url.includes("/moments/")) {
                devLog("◀️ MOMENTS response", { method, url, status, durationMs })
            } else if (url.includes("/auth/")) {
                devLog("◀️ AUTH response", { method, url, status, durationMs })
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
    friendship: friendshipRoutes,
    chat: chatRoutes,
}
