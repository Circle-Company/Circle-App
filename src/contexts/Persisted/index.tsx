import React from "react"
import { AppState } from "react-native"
import api, { apiRoutes } from "../../services/Api"
import { storage, storageKeys } from "../../store"
import AuthContext from "../auth"
import { useAccountStore } from "./persistedAccount"
import { useHistoryStore } from "./persistedHistory"
import { usePermissionsStore } from "./persistedPermissions"
import { usePreferencesStore } from "./persistedPreferences"
import { useStatisticsStore } from "./persistedStatistics"
import { useUserStore } from "./persistedUser"
import { DeviceDataType, SessionDataType } from "./types"

type PersistedProviderProps = { children: React.ReactNode }
export type PersistedContextProps = {
    session: SessionDataType
    device: DeviceDataType
}

const PersistedContext = React.createContext<PersistedContextProps>({} as PersistedContextProps)

export function Provider({ children }: PersistedProviderProps) {
    const { sessionData, signOut, checkIsSigned } = React.useContext(AuthContext)

    const sessionUser = useUserStore()
    const sessionAccount = useAccountStore()
    const sessionPreferences = usePreferencesStore()
    const sessionStatistics = useStatisticsStore()
    const sessionHistory = useHistoryStore()
    const devicePermissions = usePermissionsStore()

    React.useEffect(() => {
        if (sessionData.user) sessionUser.set(sessionData.user)
        if (sessionData.account) sessionAccount.set(sessionData.account)
        if (sessionData.preferences) sessionPreferences.set(sessionData.preferences)
        if (sessionData.statistics) sessionStatistics.set(sessionData.statistics)
        if (sessionData.history) sessionHistory.set(sessionData.history)
    }, [sessionData])

    React.useEffect(() => {
        devicePermissions.set({
            postNotifications: false,
            firebaseMessaging: false,
        })
    }, [])
    let timeoutId: NodeJS.Timeout | null = null

    React.useEffect(() => {
        api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Token expirou, tenta renová-lo
                    await refreshJwtToken({
                        username: storage.getString(storageKeys().user.username) || "",
                        id: storage.getNumber(storageKeys().user.id) || 0,
                    })
                    // Reenvia a requisição original após renovar o token
                    const originalRequest = error.config
                    return api.request(originalRequest)
                }
                return Promise.reject(error)
            }
        )
    }, [])

    function monitorJwtExpiration() {
        const expirationTime = Number(sessionAccount.jwtExpiration) * 1000 // Em milissegundos
        const renewalThreshold = 60000 // 60 segundos

        const timeRemaining = expirationTime - Date.now()

        // Verifica se o tempo restante é maior que o threshold e não existe um timeout ativo
        if (timeRemaining > renewalThreshold && !timeoutId) {
            // Armazena o tempo de expiração para persistência
            storage.set(storageKeys().account.jwt.expiration, expirationTime.toString())

            timeoutId = setTimeout(() => {
                refreshJwtToken({
                    username: storage.getString(storageKeys().user.username) || "",
                    id: storage.getNumber(storageKeys().user.id) || 0,
                })
                storage.delete(storageKeys().account.jwt.expiration) // Limpa após a renovação
            }, timeRemaining - renewalThreshold)

            // Listener para app sendo fechado ou reaberto
            const handleAppStateChange = (nextAppState: string) => {
                if (nextAppState === "active") {
                    // Quando o app reabre, checa o tempo restante
                    const storedExpirationTime = storage.getString(
                        storageKeys().account.jwt.expiration
                    )

                    if (storedExpirationTime) {
                        const storedTimeRemaining = parseInt(storedExpirationTime) - Date.now()
                        if (storedTimeRemaining <= renewalThreshold) {
                            refreshJwtToken({
                                username: storage.getString(storageKeys().user.username) || "",
                                id: storage.getNumber(storageKeys().user.id) || 0,
                            })
                        } else if (!timeoutId) {
                            // Reagendar renovação
                            timeoutId = setTimeout(() => {
                                refreshJwtToken({
                                    username: storage.getString(storageKeys().user.username) || "",
                                    id: storage.getNumber(storageKeys().user.id) || 0,
                                })
                            }, storedTimeRemaining - renewalThreshold)
                        }
                    }
                } else if (nextAppState === "inactive" || nextAppState === "background") {
                    if (timeoutId) {
                        clearTimeout(timeoutId) // Cancela o timeout ao fechar ou minimizar o app
                        timeoutId = null
                    }
                }
            }

            const subscription = AppState.addEventListener("change", handleAppStateChange)

            // Cleanup: remove listener e timeout quando o componente desmonta
            return () => {
                if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = null
                }
                subscription.remove() // Remove o listener
            }
        } else if (timeRemaining <= renewalThreshold && !timeoutId) {
            refreshJwtToken({
                username: storage.getString(storageKeys().user.username) || "",
                id: storage.getNumber(storageKeys().user.id) || 0,
            })
        }
    }

    async function refreshJwtToken({ username, id }: { username: string; id: number }) {
        if (username && id !== 0) {
            const response = await apiRoutes.auth.refreshToken({ username, id })
            sessionAccount.setJwtToken(response.data.jwtToken)
            sessionAccount.setJwtExpiration(response.data.jwtExpiration)

            timeoutId = null // Reinicia o controle de timeout
            monitorJwtExpiration() // Reconfigura o monitoramento
        }
    }

    React.useEffect(() => {
        const isSigned = checkIsSigned()
        if (!isSigned) {
            sessionUser.remove()
            sessionAccount.remove()
            sessionPreferences.remove()
            sessionStatistics.remove()
            sessionHistory.remove()
        }
    }, [signOut])

    const contextValue: any = {
        session: {
            user: sessionUser,
            account: sessionAccount,
            preferences: sessionPreferences,
            statistics: sessionStatistics,
            history: sessionHistory,
        },
        device: {
            permissions: devicePermissions,
        },
    }

    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}

export default PersistedContext
