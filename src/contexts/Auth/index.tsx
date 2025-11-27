import React, { useCallback, useState } from "react"
import {
    getDeviceId,
    getDeviceName,
    getDeviceToken,
    getIpAddress,
    getMacAddress,
    getTotalDiskCapacity,
    getUniqueId,
} from "react-native-device-info"
import { storage, storageKeys } from "../../store"

import { Platform } from "react-native"
import { RedirectContext } from "../redirect"
import { SessionDataType } from "../Persisted/types"
import api from "../../services/Api"

type AuthProviderProps = { children: React.ReactNode }

export type AuthContextsData = {
    loading: boolean
    errorMessage: string
    signInputUsername: string
    signInputPassword: string
    sessionData: SessionDataType
    getSessionData: ({ sessionId }: { sessionId: string }) => Promise<void>
    signIn: () => Promise<void>
    signUp: () => Promise<void>
    signOut(): void
    checkIsSigned: () => boolean
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>
    setSignInputPassword: React.Dispatch<React.SetStateAction<string>>
    setSignInputUsername: React.Dispatch<React.SetStateAction<string>>
}

const AuthContext = React.createContext<AuthContextsData>({} as AuthContextsData)

// Função de validação de dados de sessão
function validateSessionData(data: any): data is SessionDataType {
    return (
        data &&
        typeof data === "object" &&
        data.user &&
        typeof data.user === "object" &&
        data.user.id &&
        data.user.username &&
        data.account &&
        typeof data.account === "object" &&
        data.account.jwtToken
    )
}

// Função para persistir dados de sessão de forma segura
function persistSessionData(session: SessionDataType): void {
    try {
        const keys = storageKeys()

        // Persistir dados do usuário
        if (session.user) {
            storage.set(keys.user.id, session.user.id)
            storage.set(keys.user.name, session.user.name || "")
            storage.set(keys.user.username, session.user.username)
            storage.set(keys.user.description, session.user.description || "")
            storage.set(keys.user.verifyed, session.user.verifyed || false)
            if (session.user.profile_picture) {
                storage.set(
                    keys.user.profile_picture.small,
                    session.user.profile_picture.small_resolution || "",
                )
                storage.set(
                    keys.user.profile_picture.tiny,
                    session.user.profile_picture.tiny_resolution || "",
                )
            }
        }

        // Persistir dados da conta
        if (session.account) {
            storage.set(keys.account.jwt.token, session.account.jwtToken)
            if (session.account.jwtExpiration) {
                storage.set(keys.account.jwt.expiration, session.account.jwtExpiration)
            }
            if (session.account.coordinates) {
                storage.set(keys.account.coordinates.latitude, session.account.coordinates.latitude)
                storage.set(
                    keys.account.coordinates.longitude,
                    session.account.coordinates.longitude,
                )
            }
            storage.set(
                keys.account.unreadNotificationsCount,
                session.account.unreadNotificationsCount || 0,
            )
            storage.set(keys.account.blocked, session.account.blocked || false)
            storage.set(keys.account.muted, session.account.muted || false)
            storage.set(keys.account.last_active_at, session.account.last_active_at || "")
            storage.set(keys.account.last_login_at, session.account.last_login_at || "")
        }

        // Persistir estatísticas
        if (session.statistics) {
            storage.set(
                keys.statistics.total_followers,
                session.statistics.total_followers_num || 0,
            )
            storage.set(keys.statistics.total_likes, session.statistics.total_likes_num || 0)
            storage.set(keys.statistics.total_views, session.statistics.total_views_num || 0)
        }

        // Persistir preferências
        if (session.preferences) {
            if (session.preferences.primaryLanguage) {
                storage.set(keys.preferences.primaryLanguage, session.preferences.primaryLanguage)
            }
            if (session.preferences.appLanguage) {
                storage.set(keys.preferences.appLanguage, session.preferences.appLanguage)
            }
            if (session.preferences.autoplay !== undefined) {
                storage.set(keys.preferences.autoplay, session.preferences.autoplay)
            }
            if (session.preferences.haptics !== undefined) {
                storage.set(keys.preferences.haptics, session.preferences.haptics)
            }
            if (session.preferences.translation !== undefined) {
                storage.set(keys.preferences.translation, session.preferences.translation)
            }
            if (session.preferences.translationLanguage) {
                storage.set(
                    keys.preferences.translationLanguage,
                    session.preferences.translationLanguage,
                )
            }
            if (session.preferences.muteAudio !== undefined) {
                storage.set(keys.preferences.muteAudio, session.preferences.muteAudio)
            }
            if (session.preferences.likeMoment !== undefined) {
                storage.set(keys.preferences.likeMoment, session.preferences.likeMoment)
            }
            if (session.preferences.newMemory !== undefined) {
                storage.set(keys.preferences.newMemory, session.preferences.newMemory)
            }
            if (session.preferences.addToMemory !== undefined) {
                storage.set(keys.preferences.addToMemory, session.preferences.addToMemory)
            }
            if (session.preferences.followUser !== undefined) {
                storage.set(keys.preferences.followUser, session.preferences.followUser)
            }
            if (session.preferences.viewUser !== undefined) {
                storage.set(keys.preferences.viewUser, session.preferences.viewUser)
            }
        }

        // Persistir histórico
        if (session.history && session.history.search) {
            storage.set(keys.history.search, JSON.stringify(session.history.search))
        }

        // Persistir sessionId
        storage.set("@circle:sessionId", session.user.id.toString())

        console.log("✅ Dados de sessão persistidos com sucesso")
    } catch (error) {
        console.error("❌ Erro ao persistir dados de sessão:", error)
        throw new Error("Falha ao salvar dados de sessão localmente")
    }
}

export function Provider({ children }: AuthProviderProps) {
    const { setRedirectTo } = React.useContext(RedirectContext)
    const [signInputUsername, setSignInputUsername] = React.useState("")
    const [signInputPassword, setSignInputPassword] = React.useState("")
    const [sessionData, setSessionData] = useState<SessionDataType>({} as SessionDataType)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const signIn = useCallback(async () => {
        if (!signInputUsername.trim() || !signInputPassword.trim()) {
            setErrorMessage("Usuário e senha são obrigatórios")
            return
        }

        setErrorMessage("")
        setLoading(true)

        try {
            const response = await api.post("/auth/sign-in", {
                username: signInputUsername.trim(),
                password: signInputPassword,
            })

            if (!response.data || !response.data.session) {
                throw new Error("Resposta inválida do servidor")
            }

            const session = response.data.session

            if (!validateSessionData(session)) {
                throw new Error("Dados de sessão inválidos")
            }

            // Persistir dados localmente
            persistSessionData(session)

            // Atualizar estado
            setSessionData(session)

            // Redirecionar para app
            setRedirectTo("APP")

            console.log("✅ Login realizado com sucesso")
        } catch (error: any) {
            console.error("❌ Erro no login:", error)

            let errorMsg = "Erro interno do servidor"
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message.split(". ")[0]
            } else if (error.message) {
                errorMsg = error.message
            }

            setErrorMessage(errorMsg)
        } finally {
            setLoading(false)
        }
    }, [signInputUsername, signInputPassword, setRedirectTo])

    const signUp = useCallback(async () => {
        if (!signInputUsername.trim() || !signInputPassword.trim()) {
            setErrorMessage("Usuário e senha são obrigatórios")
            return
        }

        if (signInputPassword.length < 4) {
            setErrorMessage("A senha deve ter pelo menos 4 caracteres")
            return
        }

        setErrorMessage("")
        setLoading(true)

        try {
            const signData = {
                sign: {
                    username: signInputUsername.trim(),
                    password: signInputPassword,
                },
                metadata: {
                    device_id: getDeviceId(),
                    device_type: Platform.OS === "android" ? "android" : "ios",
                    device_name: await getDeviceName(),
                    total_device_memory: await getTotalDiskCapacity(),
                    unique_id: await getUniqueId(),
                    device_token: await getDeviceToken(),
                },
                location_info: {
                    ip_address: await getIpAddress(),
                    mac_address: await getMacAddress(),
                },
            }

            const response = await api.post("/auth/sign-up", signData)

            if (!response.data || !response.data.session) {
                throw new Error("Resposta inválida do servidor")
            }

            const session = response.data.session

            if (!validateSessionData(session)) {
                throw new Error("Dados de sessão inválidos")
            }

            // Persistir dados localmente
            persistSessionData(session)

            // Atualizar estado
            setSessionData(session)

            // Redirecionar para app
            setRedirectTo("APP")

            console.log("✅ Conta criada com sucesso")
        } catch (error: any) {
            console.error("❌ Erro na criação da conta:", error)

            let errorMsg = "Erro interno do servidor"
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message.split(". ")[0]
            } else if (error.message) {
                errorMsg = error.message
            }

            setErrorMessage(errorMsg)
        } finally {
            setLoading(false)
        }
    }, [signInputUsername, signInputPassword, setRedirectTo])

    const getSessionData = useCallback(async ({ sessionId }: { sessionId: string }) => {
        try {
            if (!sessionId) {
                throw new Error("ID da sessão é obrigatório")
            }

            const response = await api.get(`/auth/session/${sessionId}`)

            if (!response.data || !response.data.session) {
                throw new Error("Sessão não encontrada")
            }

            const session = response.data.session

            if (!validateSessionData(session)) {
                throw new Error("Dados de sessão inválidos")
            }

            // Persistir dados localmente
            persistSessionData(session)

            // Atualizar estado
            setSessionData(session)

            console.log("✅ Dados de sessão recuperados com sucesso")
        } catch (error: any) {
            console.error("❌ Erro ao recuperar dados da sessão:", error)

            // Se não conseguir recuperar a sessão, fazer logout
            signOut()
        }
    }, [])

    const signOut = useCallback(() => {
        try {
            // Limpar storage
            storage.clearAll()

            // Limpar estado
            setSessionData({} as SessionDataType)
            setSignInputUsername("")
            setSignInputPassword("")
            setErrorMessage("")

            // Redirecionar para auth
            setRedirectTo("AUTH")

            console.log("✅ Logout realizado com sucesso")
        } catch (error) {
            console.error("❌ Erro no logout:", error)
            // Forçar redirecionamento mesmo com erro
            setRedirectTo("AUTH")
        }
    }, [setRedirectTo])

    const checkIsSigned = useCallback((): boolean => {
        try {
            const sessionId = storage.getString("@circle:sessionId")
            const userId = storage.getString(storageKeys().user.id)
            const jwtToken = storage.getString(storageKeys().account.jwt.token)

            // Verificar se temos todos os dados essenciais
            const hasEssentialData = sessionId && userId && jwtToken

            if (!hasEssentialData) {
                return false
            }

            // Verificar se o JWT não expirou (se tivermos a data de expiração)
            const jwtExpiration = storage.getString(storageKeys().account.jwt.expiration)
            if (jwtExpiration) {
                const expirationDate = new Date(jwtExpiration)
                const now = new Date()

                if (expirationDate <= now) {
                    console.log("⚠️ JWT expirado, fazendo logout automático")
                    signOut()
                    return false
                }
            }

            return true
        } catch (error) {
            console.error("❌ Erro ao verificar status de autenticação:", error)
            return false
        }
    }, [signOut])

    return (
        <AuthContext.Provider
            value={{
                loading,
                errorMessage,
                sessionData,
                signInputPassword,
                signInputUsername,
                setSignInputPassword,
                setSignInputUsername,
                getSessionData,
                setErrorMessage,
                checkIsSigned,
                signIn,
                signOut,
                signUp,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
