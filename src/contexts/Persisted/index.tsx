import React, { useCallback, useEffect } from "react"
import AuthContext from "../auth"

import { AccountState, useAccountStore } from "./persist.account"
import { PreferencesState, usePreferencesStore } from "./persist.preferences"
import { MetricsState, useMetricsStore } from "./persist.metrics"
import { UserState, useUserStore } from "./persist.user"

type PersistedProviderProps = { children: React.ReactNode }
export type PersistedContextProps = {
    session: {
        user: UserState
        account: AccountState
        preferences: PreferencesState
        metrics: MetricsState
    }
    injectAuthSession: (session: any) => Promise<void>
}

const PersistedContext = React.createContext<PersistedContextProps>({} as PersistedContextProps)

export function Provider({ children }: PersistedProviderProps) {
    const { sessionData, signOut, checkIsSigned } = React.useContext(AuthContext)

    const sessionUser = useUserStore()
    const sessionAccount = useAccountStore()
    const sessionPreferences = usePreferencesStore()
    const sessionMetrics = useMetricsStore()

    // Normaliza e persiste os dados de sessão nas stores
    const syncSessionData = useCallback(
        async (session: any) => {
            try {
                // User
                if (session?.user) {
                    const status = session?.status ?? {}
                    const u = session.user
                    sessionUser.set({
                        id: u.id,
                        username: u.username,
                        name: u.name ?? "",
                        description: u.description ?? "",
                        richDescription: "",
                        isVerified: Boolean(status.verified),
                        isActive: !Boolean(status.deleted) && !Boolean(status.blocked),
                        profilePicture: u.profilePicture ?? null,
                    })
                }

                // Account (JWT e termos)
                if (session?.token || session?.refreshToken || session?.status) {
                    const status = session?.status ?? {}
                    const terms = session?.terms ?? {}
                    sessionAccount.set({
                        jwtToken:
                            typeof session?.token === "string" && session.token
                                ? session.token
                                : useAccountStore.getState().jwtToken,
                        jwtExpiration:
                            typeof session?.jwtExpiration === "string" && session.jwtExpiration
                                ? session.jwtExpiration
                                : useAccountStore.getState().jwtExpiration,
                        refreshToken:
                            typeof session?.refreshToken === "string" && session.refreshToken
                                ? session.refreshToken
                                : useAccountStore.getState().refreshToken,
                        blocked: Boolean(status.blocked),
                        accessLevel: String(status.accessLevel || ""),
                        verified: Boolean(status.verified),
                        deleted: Boolean(status.deleted),
                        terms: {
                            agreed: Boolean(terms.termsAndConditionsAgreed ?? false),
                            version: String(terms.termsAndConditionsAgreedVersion ?? ""),
                            agreedAt: String(terms.termsAndConditionsAgreedAt ?? ""),
                        },
                    })
                }

                // Preferences (app e notificações)
                if (session?.preferences?.app) {
                    const app = session.preferences.app

                    sessionPreferences.set({
                        appTimezone: Number(app.timezone ?? 0),
                        timezoneCode: String(app.timezoneCode ?? ""),
                        language: {
                            appLanguage: String(app.language ?? "en"),
                            translationLanguage: String(app.language ?? "en"),
                        },
                        content: {
                            disableAutoplay: !Boolean(app.enableAutoplayFeed),
                            disableHaptics: !Boolean(app.enableHapticFeedback),
                            disableTranslation: false,
                            muteAudio: false,
                        },
                    })
                }

                // Metrics
                if (session?.metrics) {
                    const m = session.metrics
                    sessionMetrics.set({
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
        [sessionUser, sessionAccount, sessionPreferences, sessionMetrics],
    )

    // Limpa todas as stores (logout ou sessão inválida)
    const clearAllStores = useCallback(() => {
        try {
            sessionUser.remove()
            sessionAccount.remove()
            sessionPreferences.remove()
            sessionMetrics.remove()

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
    }, [sessionUser, sessionAccount, sessionPreferences, sessionMetrics])

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
            // Detecta logout: sessionData ficou null depois de ter dados
            sessionDataRef.current = ""
            clearAllStores()
        }
    }, [sessionData, clearAllStores, signOut, syncSessionData])

    // Garante limpeza das stores quando o usuário sai
    const [hasCleaned, setHasCleaned] = React.useState(false)

    useEffect(() => {
        const isSigned = checkIsSigned()

        if (!isSigned && sessionUser.id && !hasCleaned) {
            clearAllStores()
            setHasCleaned(true)
        }
        if (isSigned && hasCleaned) {
            setHasCleaned(false)
        }
    }, [sessionUser.id, checkIsSigned, clearAllStores, hasCleaned])

    const injectAuthSession = useCallback(
        async (payload: any) => {
            // Normaliza o payload de autenticação (quando for o formato bruto)
            const raw = payload && (payload as any).session ? (payload as any).session : null

            const normalized = raw
                ? {
                      user: raw.user ?? {},
                      token: raw.token ?? "",
                      refreshToken: raw.refreshToken,
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

    const contextValue: PersistedContextProps = {
        session: {
            user: sessionUser,
            account: sessionAccount,
            preferences: sessionPreferences,
            metrics: sessionMetrics,
        },
        injectAuthSession,
    }

    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}

export default PersistedContext
