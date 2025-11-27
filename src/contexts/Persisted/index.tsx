import { AccountState, useAccountStore } from "./persistedAccount"
import { DeviceDataType, SessionDataType } from "./types"
import { DeviceMetadataState, useDeviceMetadataStore } from "./persistedDeviceMetadata"
import { HistoryState, useHistoryStore } from "./persistedHistory"
import { PermissionsState, usePermissionsStore } from "./persistedPermissions"
import { PreferencesState, usePreferencesStore } from "./persistedPreferences"
import React, { useCallback, useEffect } from "react"
import { StatisticsState, useStatisticsStore } from "./persistedStatistics"
import { UserState, useUserStore } from "./persistedUser"

import AuthContext from "../Auth/index"
import { refreshJwtToken } from "../../lib/hooks/useRefreshJwtToken"

type PersistedProviderProps = { children: React.ReactNode }
export type PersistedContextProps = {
    session: {
        user: UserState
        account: AccountState
        preferences: PreferencesState
        statistics: StatisticsState
        history: HistoryState
    }
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
    const deviceMetadata = useDeviceMetadataStore()

    // Função para sincronizar dados de sessão com as stores
    const syncSessionData = useCallback(
        async (session: SessionDataType) => {
            try {
                console.log("🔄 Sincronizando dados de sessão...")

                // Sincronizar dados do usuário
                if (session.user) {
                    sessionUser.set(session.user)
                    console.log("✅ Usuário sincronizado")
                }

                // Sincronizar dados da conta
                if (session.account) {
                    sessionAccount.set(session.account)
                    console.log("✅ Conta sincronizada")
                }

                // Sincronizar preferências
                if (session.preferences) {
                    sessionPreferences.set(session.preferences)
                    console.log("✅ Preferências sincronizadas")
                }

                // Sincronizar estatísticas
                if (session.statistics) {
                    sessionStatistics.set(session.statistics)
                    console.log("✅ Estatísticas sincronizadas")
                }

                // Sincronizar histórico
                if (session.history) {
                    sessionHistory.set(session.history)
                    console.log("✅ Histórico sincronizado")
                }

                // Atualizar metadados do dispositivo
                try {
                    await deviceMetadata.updateAll()
                    console.log("✅ Metadados do dispositivo atualizados")
                } catch (error) {
                    console.warn("⚠️ Erro ao atualizar metadados:", error)
                }

                console.log("✅ Sincronização concluída com sucesso")
            } catch (error) {
                console.error("❌ Erro na sincronização:", error)
                throw error
            }
        },
        [
            sessionUser,
            sessionAccount,
            sessionPreferences,
            sessionStatistics,
            sessionHistory,
            deviceMetadata,
        ],
    )

    // Função para limpar todas as stores
    const clearAllStores = useCallback(() => {
        try {
            console.log("🧹 Limpando todas as stores...")

            sessionUser.remove()
            sessionAccount.remove()
            sessionPreferences.remove()
            sessionStatistics.remove()
            sessionHistory.remove()

            console.log("✅ Stores limpas com sucesso")
        } catch (error) {
            console.error("❌ Erro ao limpar stores:", error)
        }
    }, [sessionUser, sessionAccount, sessionPreferences, sessionStatistics, sessionHistory])

    // Sincronizar dados quando sessionData mudar
    useEffect(() => {
        if (sessionData && sessionData.user && sessionData.account) {
            syncSessionData(sessionData).catch((error) => {
                console.error("❌ Falha na sincronização automática:", error)
                // Em caso de falha na sincronização, fazer logout
                signOut()
            })
        }
    }, [sessionData, syncSessionData, signOut])

    // Configurar permissões e refresh token na inicialização
    useEffect(() => {
        const initializeDevice = async () => {
            try {
                console.log("🚀 Inicializando dispositivo...")

                // Configurar permissões padrão
                devicePermissions.set({
                    postNotifications: false,
                    firebaseMessaging: false,
                })

                // Tentar fazer refresh do token se houver dados de usuário
                if (sessionUser.id && sessionAccount.jwtToken) {
                    try {
                        await refreshJwtToken(
                            { username: sessionUser.username, id: sessionUser.id },
                            sessionAccount,
                        )
                        console.log("✅ Token atualizado com sucesso")
                    } catch (error) {
                        console.warn("⚠️ Erro ao atualizar token:", error)
                        // Se não conseguir atualizar o token, verificar se ainda é válido
                        if (!checkIsSigned()) {
                            console.log("⚠️ Token inválido, fazendo logout")
                            signOut()
                        }
                    }
                }

                console.log("✅ Dispositivo inicializado")
            } catch (error) {
                console.error("❌ Erro na inicialização do dispositivo:", error)
            }
        }

        initializeDevice()
    }, [
        devicePermissions,
        sessionUser.id,
        sessionUser.username,
        sessionAccount.jwtToken,
        refreshJwtToken,
        checkIsSigned,
        signOut,
    ])

    // Limpar stores quando fizer logout
    useEffect(() => {
        const isSigned = checkIsSigned()
        if (!isSigned) {
            clearAllStores()
        }
    }, [signOut, checkIsSigned, clearAllStores])

    const contextValue: PersistedContextProps = {
        session: {
            user: sessionUser,
            account: sessionAccount,
            preferences: sessionPreferences,
            statistics: sessionStatistics,
            history: sessionHistory,
        },
        device: {
            permissions: devicePermissions,
            metadata: deviceMetadata,
        },
    }

    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}

export default PersistedContext
