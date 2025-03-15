import React from "react"
import AuthContext from "../auth"
import { monitorJwtExpiration, refreshJwtToken } from "./jwtManager"
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
    const { sessionData, signOut, checkIsSigned, signIn, signUp } = React.useContext(AuthContext)

    const sessionUser = useUserStore()
    const sessionAccount = useAccountStore()
    const sessionPreferences = usePreferencesStore()
    const sessionStatistics = useStatisticsStore()
    const sessionHistory = useHistoryStore()
    const devicePermissions = usePermissionsStore()

    // Ref para garantir que o monitoramento seja iniciado apenas uma vez
    const isMonitoringJwtRef = React.useRef(false)

    React.useEffect(() => {
        if (sessionData.user) sessionUser.set(sessionData.user)
        if (sessionData.account) sessionAccount.set(sessionData.account)
        if (sessionData.preferences) sessionPreferences.set(sessionData.preferences)
        if (sessionData.statistics) sessionStatistics.set(sessionData.statistics)
        if (sessionData.history) sessionHistory.set(sessionData.history)

        if (sessionUser.username && sessionUser.id) {
            monitorJwtExpiration(
                sessionAccount,
                async ({ username, id }: { username: string; id: string }) => {
                    try {
                        await refreshJwtToken({ username, id }, sessionAccount)
                    } catch (error) {
                        throw new Error("cant possible refresh JWT Token")
                    }
                }
            )
        }
    }, [sessionData, signIn, signUp, signOut])

    React.useEffect(() => {
        devicePermissions.set({
            postNotifications: false,
            firebaseMessaging: false,
        })
    }, [])

    // **Monitoramento contínuo do JWT**
    React.useEffect(() => {
        if (!isMonitoringJwtRef.current) {
            isMonitoringJwtRef.current = true
            console.log("🔄 Iniciando monitoramento do JWT...")

            monitorJwtExpiration(
                sessionAccount,
                async ({ username, id }: { username: string; id: string }) => {
                    try {
                        console.log("🔄 Tentando renovar o JWT...")
                        await refreshJwtToken({ username, id: id.toString() }, sessionAccount)
                    } catch (error) {
                        console.error("❌ Erro ao renovar o JWT:", error)
                    }
                }
            )

            // Configurar intervalo para verificar a cada 60 segundos
            const interval = setInterval(() => {
                console.log("⏳ Verificando expiração do JWT...")
                monitorJwtExpiration(
                    sessionAccount,
                    async ({ username, id }: { username: string; id: string }) => {
                        try {
                            console.log("🔄 Renovando token...")
                            await refreshJwtToken({ username, id: id.toString() }, sessionAccount)
                        } catch (error) {
                            console.error("❌ Falha ao renovar JWT:", error)
                        }
                    }
                )
            }, 60000) // 60 segundos

            return () => {
                console.log("🛑 Parando monitoramento do JWT...")
                clearInterval(interval)
            }
        }
    }, [])

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
