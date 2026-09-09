import React, { useCallback, useEffect } from "react"
import AuthContext from "../auth"

import { PreferencesState, usePreferencesStore } from "./preferences"
import { MetricsState, useMetricsStore } from "./metrics"
import { AccountState, useAccountStore } from "./account"
import { readSession } from "@/session/storage"
import { textLib } from "@/circle.text.library"

type PersistedProviderProps = { children: React.ReactNode }
/**
 * O que o app lê do storage persistido.
 *
 * `user` e `account` **não existem mais**. Eram dois nomes para a mesma entidade — recorte
 * do payload de login (`session.user` / `session.status`), não do domínio —, e mantê-los
 * como vistas só adiava a pergunta "qual dos dois é a verdade?". Agora há um `account`, que
 * é a store inteira (`./account`).
 *
 * O `jwtToken` também sumiu daqui: quem injeta o `Authorization` é o interceptor, a partir
 * da sessão viva (§3.2). Lê-lo de um contexto de perfil era o que mantinha viva a corrida
 * de token defasado.
 */
export type PersistedSessionView = {
    account: AccountState
    preferences: PreferencesState
    metrics: MetricsState
}

export type PersistedContextProps = {
    session: PersistedSessionView
    injectAuthSession: (session: any) => Promise<void>
}

const PersistedContext = React.createContext<PersistedContextProps>({} as PersistedContextProps)

export function Provider({ children }: PersistedProviderProps) {
    const { sessionData, signOut, checkIsSigned, isAuthenticating } = React.useContext(AuthContext)

    // Uma store só para o usuário logado. `user` e `account` eram a mesma entidade partida
    // em duas porque o backend devolve `session.user` e `session.status` separados — o que
    // é recorte do payload, não do app. Ver §11.2.
    const account = useAccountStore()
    const sessionPreferences = usePreferencesStore()
    const sessionMetrics = useMetricsStore()

    /**
     * Hidratação explícita, uma vez, na montagem.
     *
     * As stores **não** leem o storage no import — se lessem, o parse das coleções (que
     * podem ter milhares de ids) rodaria no caminho crítico do cold start, antes mesmo de o
     * app saber se há sessão. O preço de tirá-lo de lá é este efeito: sem ele as stores
     * sobem vazias e o usuário vê perfil, idioma e métricas em branco até o primeiro login.
     *
     * O `userId` da sessão vai junto de propósito: é a segunda linha de defesa do §2.6. Se
     * o blob em disco for de outra pessoa — porque a limpeza no login não rodou — ele é
     * descartado aqui, em vez de carregar os likes e as notificações lidas de outro usuário.
     */
    useEffect(() => {
        const persisted = readSession()
        const expectedUserId = persisted.state === "empty" ? undefined : persisted.identity.userId

        useAccountStore.getState().hydrate(expectedUserId)
        usePreferencesStore.getState().hydrate()
        useMetricsStore.getState().hydrate()
    }, [])

    // Normaliza e persiste os dados de sessão nas stores
    const syncSessionData = useCallback(
        async (session: any) => {
            try {
                const status = session?.status ?? {}

                // Identidade + perfil
                if (session?.user) {
                    const u = session.user
                    useAccountStore.getState().setIdentity({
                        userId: String(u.id ?? ""),
                        username: String(u.username ?? ""),
                        name: u.name ?? "",
                        profilePicture: u.profilePicture ?? "",
                    })
                }

                // Status da conta e termos. **Sem tokens**: eles saíram para `src/session/`,
                // que é o único dono deles — era a duplicação que permitia duas escritas
                // concorrentes ressuscitarem um token já invalidado (item 1 do §0).
                if (session?.status || session?.terms) {
                    const terms = session?.terms ?? {}
                    useAccountStore.getState().setStatus({
                        accessLevel: String(status.accessLevel || ""),
                        verified: Boolean(status.verified),
                        blocked: Boolean(status.blocked),
                        deleted: Boolean(status.deleted),
                        active: !Boolean(status.deleted) && !Boolean(status.blocked),
                    })
                    useAccountStore.getState().setTerms({
                        agreed: Boolean(terms.termsAndConditionsAgreed ?? false),
                        version: String(terms.termsAndConditionsAgreedVersion ?? ""),
                        agreedAt: String(terms.termsAndConditionsAgreedAt ?? ""),
                    })
                }

                // Preferences (app e notificações)
                if (session?.preferences?.app) {
                    const app = session.preferences.app
                    const deviceTzOffset = new Date().getTimezoneOffset()
                    const deviceTzCode = textLib.timezone.getCodeFromOffset(deviceTzOffset)

                    sessionPreferences.set({
                        appTimezone: deviceTzOffset,
                        timezoneCode: deviceTzCode,
                        language: {
                            appLanguage: String(app.language ?? "en"),
                            translationLanguage: String(app.language ?? "en"),
                        },
                        content: {
                            disableAutoplay: !Boolean(app.enableAutoplayFeed),
                            disableHaptics: !Boolean(app.enableHapticFeedback),
                            disableTranslation: false,
                            // Faltava, e o backend manda: sem isto o aviso de conteúdo
                            // sensível do usuário era descartado a cada login.
                            disableContentWarning: !Boolean(app.enableContentWarning),
                            muteAudio: false,
                        },
                    })
                }

                // Metrics
                if (session?.metrics) {
                    const m = session.metrics
                    sessionMetrics.set({
                        totalMoments: Number(m.totalMomentsCreated ?? m.totalMoments ?? 0),
                        totalFollowers: Number(m.totalFollowers ?? 0),
                        totalFollowing: Number(m.totalFollowing ?? 0),
                        totalLikesReceived: Number(m.totalLikesReceived ?? 0),
                        totalViewsReceived: Number(m.totalViewsReceived ?? 0),
                        followerGrowthRate30d: Number(m.followerGrowthRate30d ?? 0),
                        engagementGrowthRate30d: Number(m.engagementGrowthRate30d ?? 0),
                        interactionsGrowthRate30d: Number(m.interactionsGrowthRate30d ?? 0),
                    })
                }
            } catch (error) {
                console.error("❌ Erro na sincronização:", error)
                throw error
            }
        },
        [sessionPreferences, sessionMetrics],
    )

    // Limpa todas as stores (logout ou sessão inválida)
    const clearAllStores = useCallback(() => {
        try {
            // `.getState()` e não o objeto do hook: chamar a ação capturada no render
            // funciona, mas amarra a limpeza à instância daquele render. O `clear()` do
            // account zera memória **e** storage numa operação — antes eram quatro `remove()`
            // que podiam divergir entre si (§11.2).
            useAccountStore.getState().clear()
            useMetricsStore.getState().clear()
            // `preferences` NÃO entra aqui: é escopo `device` (§2.2). Zerá-las no logout
            // faria o app voltar para inglês na tela de login de quem nunca escolheu inglês.

            // Limpar também o header Authorization default do axios
            try {
                // Import dinâmico para evitar ciclos
                const { default: api } = require("@/api")
                if (api?.defaults?.headers?.common?.Authorization) {
                    delete api.defaults.headers.common.Authorization
                }
            } catch (_) {}
        } catch (error) {
            console.error("Erro ao limpar stores:", error)
        }
    }, [sessionPreferences, sessionMetrics])

    // Sincronizar dados quando sessionData mudar (controle para evitar loop)
    const sessionDataRef = React.useRef<string>("")

    useEffect(() => {
        // Chave de sincronização baseada em user.id + token
        const sessionKey = sessionData
            ? `${(sessionData as any)?.user?.id}-${(sessionData as any)?.token?.substring(0, 20)}`
            : ""

        // Evita sincronizações redundantes
        if (sessionData && (sessionData as any)?.user && sessionKey !== sessionDataRef.current) {
            sessionDataRef.current = sessionKey

            syncSessionData(sessionData).catch((error) => {
                console.error("Erro ao sincronizar dados:", error)
                signOut()
            })
        } else if (!sessionData && sessionDataRef.current !== "") {
            sessionDataRef.current = ""
            if (!isAuthenticating) {
                clearAllStores()
            }
        }
    }, [sessionData, clearAllStores, signOut, syncSessionData, isAuthenticating])

    // Garante limpeza das stores quando o usuário sai
    const [hasCleaned, setHasCleaned] = React.useState(false)

    useEffect(() => {
        const isSigned = checkIsSigned()

        if (!isSigned && account.userId && !hasCleaned && !isAuthenticating) {
            clearAllStores()
            setHasCleaned(true)
        }
        if (isSigned && hasCleaned) {
            setHasCleaned(false)
        }
    }, [account.userId, checkIsSigned, clearAllStores, hasCleaned, isAuthenticating])

    const injectAuthSession = useCallback(
        async (payload: any) => {
            // Normaliza o payload de autenticação (quando for o formato bruto)
            const raw = payload && (payload as any).session ? (payload as any).session : null

            // Os tokens já apareceram sob nomes diferentes conforme a rota
            // (signin, signup, apple) e podem vir no nível de cima em vez de
            // dentro de `session`. Ler só `raw.token` fazia o login "passar"
            // sem gravar nada e o app entrava logado sem credencial.
            const pickToken = (...candidates: unknown[]) =>
                candidates.find((c): c is string => typeof c === "string" && c.length > 0) ?? ""

            const accessToken = pickToken(
                raw?.token,
                raw?.accessToken,
                raw?.access_token,
                payload?.token,
                payload?.accessToken,
            )

            const refreshToken = pickToken(
                raw?.refreshToken,
                raw?.refresh_token,
                payload?.refreshToken,
                payload?.refresh_token,
            )

            const normalized = raw
                ? {
                      user: raw.user ?? {},
                      token: accessToken,
                      refreshToken: refreshToken || undefined,
                      status: raw.status ?? {},
                      preferences: {
                          app: {
                              language: raw.preferences?.app?.language,
                              timezone: raw.preferences?.app?.timezone,
                              timezoneCode: raw.preferences?.app?.timezoneCode,
                              enableAutoplayFeed: raw.preferences?.app?.enableAutoplayFeed,
                              enableHapticFeedback: raw.preferences?.app?.enableHapticFeedback,
                          },
                      },
                      metrics: raw.metrics ?? {},
                      terms: raw.terms ?? {},
                  }
                : payload

            await syncSessionData(normalized)
        },
        [syncSessionData],
    )
    // Uma entidade, um nome. O `account` é a store inteira — sem recortes, sem apelidos e
    // sem token: identidade, status, termos e coleções de interação do usuário logado.
    const session = React.useMemo<PersistedSessionView>(
        () => ({ account, preferences: sessionPreferences, metrics: sessionMetrics }),
        [account, sessionPreferences, sessionMetrics],
    )
    const contextValue: PersistedContextProps = { session, injectAuthSession }

    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}

export default PersistedContext
