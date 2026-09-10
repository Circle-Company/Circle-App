import { safeSet, storageKeys } from "@/store"

import { decodeExp, decodeSub } from "./jwt"

/**
 * A escrita das credenciais no login.
 *
 * **Por que este módulo existe.** Até a Fase 3 (`docs/session-management.md` §12) as chaves
 * `account:jwt:*` são a FONTE das credenciais: `legacyCredentials()` em `./runtime` monta a
 * `Session` a partir delas, o interceptor de request lê o access token de lá, e `recordLogin`
 * só grava o blob se elas já estiverem no disco. Quem escrevia era a store `account` do
 * `Persisted`, via `setAccount({ jwtToken, refreshToken, ... })`.
 *
 * Quando os tokens saíram da store — corretamente, porque ter vários donos do par era o que
 * permitia duas escritas concorrentes ressuscitarem um token invalidado — **nenhum
 * substituto assumiu a escrita no login**. O resultado: o login autenticava no backend, não
 * gravava credencial nenhuma, e a asserção do `AuthProvider` derrubava a sessão com
 * "Sessão inválida: o servidor não retornou o token de acesso". É este o dono que faltava.
 *
 * O par é escrito **junto** (§2.3/P1): nunca existe um instante com access novo e refresh
 * velho, que é um refresh token queimado.
 */

export type LoginCredentials = {
    accessToken: string
    refreshToken: string
}

/**
 * Os tokens já apareceram sob nomes diferentes conforme a rota (signin, signup, apple) e
 * podem vir no nível de cima em vez de dentro de `session`. Ler só `token` fazia o login
 * "passar" sem gravar nada.
 */
const pickString = (...candidates: unknown[]): string =>
    candidates.find((c): c is string => typeof c === "string" && c.length > 0) ?? ""

const unwrap = (payload: any) => (payload && payload.session ? payload.session : payload)

/** O par contido no payload de login, ou `null` quando não há access token. */
export function extractCredentials(payload: any): LoginCredentials | null {
    const raw = unwrap(payload)

    const accessToken = pickString(
        raw?.token,
        raw?.accessToken,
        raw?.access_token,
        payload?.token,
        payload?.accessToken,
    )
    if (!accessToken) return null

    const refreshToken = pickString(
        raw?.refreshToken,
        raw?.refresh_token,
        payload?.refreshToken,
        payload?.refresh_token,
    )

    return { accessToken, refreshToken }
}

/**
 * Persiste o que o login acabou de receber e devolve o par gravado (ou `null` se o payload
 * não trazia access token — caso em que quem chama deve tratar como login inválido).
 *
 * Grava também `user:*` e o status da conta: `recordLogin` monta o blob da sessão a partir
 * dessas chaves (`readProfileFromLegacyKeys` / `readStatusFromLegacyKeys`), e o Mixpanel lê
 * o id e o username de lá. Sem elas o blob nasce com perfil vazio e a tela de entrada não
 * tem o "@fulano" para oferecer no próximo cold start (§5.8).
 *
 * Deve ser chamada **depois** do guard de identidade (§2.6): ele varre o escopo do usuário,
 * e o que fosse escrito antes iria junto.
 */
export function persistLoginSession(payload: any): LoginCredentials | null {
    const credentials = extractCredentials(payload)
    if (!credentials) return null

    const keys = storageKeys()
    const raw = unwrap(payload)
    const user = raw?.user ?? {}
    const status = raw?.status ?? {}

    safeSet(keys.account.jwt.token, credentials.accessToken)
    // `safeSet` com string vazia apaga a chave: uma sessão sem refresh não deixa para trás
    // o refresh do login anterior, que pertence a outro par.
    safeSet(keys.account.jwt.refreshToken, credentials.refreshToken || undefined)

    // A expiração vem do próprio `exp` do JWT, não de um campo do payload: é a mesma fonte
    // que `isAccessTokenExpired` consulta, então as duas leituras nunca divergem.
    const exp = decodeExp(credentials.accessToken)
    safeSet(
        keys.account.jwt.expiration,
        exp === null ? undefined : new Date(exp * 1000).toISOString(),
    )

    // O `sub` do token é o plano B do id: o payload pode não trazer `user.id`, e sem id o
    // `legacyCredentials()` não tem identidade para dar à `Session`.
    const userId =
        pickString(user?.id === undefined ? "" : String(user.id)) ||
        decodeSub(credentials.accessToken) ||
        ""
    safeSet(keys.user.id, userId || undefined)
    safeSet(keys.user.username, pickString(user?.username) || undefined)
    safeSet(keys.user.name, pickString(user?.name) || undefined)
    safeSet(keys.user.profilePicture, pickString(user?.profilePicture) || undefined)

    safeSet(keys.account.accessLevel, pickString(status?.accessLevel) || undefined)
    safeSet(keys.account.verified, Boolean(status?.verified))
    safeSet(keys.account.blocked, Boolean(status?.blocked))
    safeSet(keys.account.deleted, Boolean(status?.deleted))

    return credentials
}
