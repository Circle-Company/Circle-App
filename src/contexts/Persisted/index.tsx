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
            console.log("🔍 Verificando se sessionUser.id foi zerado:", sessionUser.id)
        } catch (error) {
            console.error("❌ Erro ao limpar stores:", error)
        }
    }, [sessionUser, sessionAccount, sessionPreferences, sessionStatistics, sessionHistory])

    // Sincronizar dados quando sessionData mudar (controle para evitar loop)
    const [hasSynced, setHasSynced] = React.useState(false)
    const sessionDataRef = React.useRef<string>("")

    useEffect(() => {
        // Criar uma chave única para identificar se os dados mudaram
        const sessionKey = sessionData
            ? `${sessionData.user?.id}-${sessionData.account?.jwtToken?.substring(0, 20)}`
            : ""

        // Só sincroniza se houver sessionData E se for diferente da última sincronização
        if (
            sessionData &&
            sessionData.user &&
            sessionData.account &&
            sessionKey !== sessionDataRef.current
        ) {
            console.log("🔄 Nova sessão detectada, sincronizando...")
            sessionDataRef.current = sessionKey

            syncSessionData(sessionData).catch((error) => {
                console.error("❌ Falha na sincronização automática:", error)
                // Em caso de falha na sincronização, fazer logout
                signOut()
            })
        }
    }, [sessionData])

    // Configurar permissões e refresh token na inicialização (controle para evitar loop)
    const [hasInitialized, setHasInitialized] = React.useState(false)

    useEffect(() => {
        const initializeDevice = async () => {
            // Só inicializa uma vez
            if (hasInitialized) {
                return
            }

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
                setHasInitialized(true)
            } catch (error) {
                console.error("❌ Erro na inicialização do dispositivo:", error)
            }
        }

        initializeDevice()
    }, []) // Array vazio para executar apenas uma vez ao montar

    // Limpar stores quando fizer logout (controle para evitar loop)
    const [hasCleaned, setHasCleaned] = React.useState(false)

    useEffect(() => {
        const isSigned = checkIsSigned()
        console.log(`🔍 [PersistedProvider] Verificando limpeza:`, {
            isSigned,
            sessionUserId: sessionUser.id,
            hasCleaned,
        })

        if (!isSigned && sessionUser.id && !hasCleaned) {
            console.log("🧹 [PersistedProvider] Iniciando limpeza de stores...")
            clearAllStores()
            setHasCleaned(true)
            console.log("✅ [PersistedProvider] Flag de limpeza marcado como true")
        }
        if (isSigned && hasCleaned) {
            console.log("🔄 [PersistedProvider] Usuário logado, resetando flag de limpeza")
            setHasCleaned(false) // Reset flag ao logar novamente
        }
    }, [sessionUser.id, checkIsSigned, clearAllStores, hasCleaned])

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
