import React, { useState } from "react"
import DeviceInfo from "react-native-device-info"

import { apiRoutes } from "@/api"
import { storage, storageKeys } from "@/store"
import { useUserStore } from "@/contexts/Persisted/persist.user"
import { useAccountStore } from "@/contexts/Persisted/persist.account"
import { useMetricsStore } from "@/contexts/Persisted/persist.metrics"
import { usePreferencesStore } from "@/contexts/Persisted/persist.preferences"
import PersistedContext, { Provider as PersistedProvider } from "@/contexts/Persisted"
import { RedirectContext } from "@/contexts/redirect"
import { SessionDataType } from "@/contexts/Persisted/types"

type AuthProviderProps = { children: React.ReactNode }

export type AuthContextsData = {
    loading: boolean
    errorMessage: string
    signInputUsername: string
    signInputPassword: string
    sessionData: SessionDataType | null
    signIn: () => Promise<void>
    signUp: () => Promise<void>
    signOut(): void
    checkIsSigned: () => boolean
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>
    setSignInputPassword: React.Dispatch<React.SetStateAction<string>>
    setSignInputUsername: React.Dispatch<React.SetStateAction<string>>
}

const AuthContext = React.createContext<AuthContextsData>({} as AuthContextsData)

export function Provider({ children }: AuthProviderProps) {
    const { setRedirectTo } = React.useContext(RedirectContext)
    const [signInputUsername, setSignInputUsername] = React.useState("")
    const [signInputPassword, setSignInputPassword] = React.useState("")
    const [sessionData, setSessionData] = useState<SessionDataType | null>(null)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const injectRef = React.useRef<null | ((session: any) => Promise<void>)>(null)

    const PersistedConsumerBinder = () => {
        const { injectAuthSession } = React.useContext(PersistedContext)
        React.useEffect(() => {
            injectRef.current = injectAuthSession
        }, [injectAuthSession])
        return null
    }

    const detectTimezoneHeader = (): string => {
        try {
            const offsetMinutes = new Date().getTimezoneOffset()
            if (offsetMinutes === 180) {
                return "BRT"
            }
        } catch (error) {
            console.warn("⚠️ Não foi possível determinar o offset de timezone:", error)
        }

        return "UTC"
    }

    const signIn = async () => {
        if (!signInputUsername.trim() || !signInputPassword.trim()) {
            setErrorMessage("Usuário e senha são obrigatórios")
            return
        }

        setErrorMessage("")
        setLoading(true)

        try {
            const response = await apiRoutes.auth.signIn(
                {
                    username: signInputUsername.trim(),
                    password: signInputPassword,
                },
                {
                    "terms-accepted": "true",
                    "forwarded-for": await DeviceInfo.getIpAddress(),
                    "machine-id": await DeviceInfo.getUniqueId(),
                    timezone: detectTimezoneHeader(),
                    latitude: "0",
                    longitude: "0",
                    device: "mobile",
                    "Content-Type": "application/json",
                },
            )

            if (!response.data || !response.data.session) {
                throw new Error("Resposta inválida do servidor")
            }

            const sessionPayload = response.data.session

            await injectRef.current?.({ session: sessionPayload })
            // Persist sessionId for compatibility with legacy checks
            storage.set("@circle:sessionId", sessionPayload.user?.id ?? "")
            setRedirectTo("APP")
            // Navigation handled by RootLayoutNav via redirectTo
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
    }

    const signUp = async () => {
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
            const response = await apiRoutes.auth.signUp(
                {
                    username: signInputUsername.trim(),
                    password: signInputPassword,
                },
                {
                    "terms-accepted": "true",
                    "forwarded-for": await DeviceInfo.getIpAddress(),
                    "machine-id": await DeviceInfo.getUniqueId(),
                    timezone: detectTimezoneHeader(),
                    latitude: "0",
                    longitude: "0",
                    device: "mobile",
                    "Content-Type": "application/json",
                },
            )
            if (!response.data || !response.data.session) {
                throw new Error("Resposta inválida do servidor")
            }

            const sessionPayload = response.data.session

            await injectRef.current?.({ session: sessionPayload })
            // Persist sessionId for compatibility with legacy checks
            storage.set("@circle:sessionId", sessionPayload.user?.id ?? "")
            setRedirectTo("APP")
            // Navigation handled by RootLayoutNav via redirectTo
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
    }

    const signOut = () => {
        try {
            storage.clearAll()
            setSessionData(null)
            setSignInputUsername("")
            setSignInputPassword("")
            setErrorMessage("")

            setRedirectTo("AUTH")
            // Limpa stores persistidas do usuário
            try {
                useUserStore().remove()
                useAccountStore().remove()
                usePreferencesStore().remove()
                useMetricsStore().remove()
            } catch (e) {
                console.warn("⚠️ Não foi possível limpar stores persistidas do usuário:", e)
            }
        } catch (error) {
            console.error("❌ Erro no logout:", error)
            setRedirectTo("AUTH")
        }
    }

    const checkIsSigned = (): boolean => {
        try {
            const sessionId = storage.getString("@circle:sessionId")
            const userId = storage.getString(storageKeys().user.id)
            const jwtToken = storage.getString(storageKeys().account.jwt.token)

            const hasEssentialData = Boolean(userId) && Boolean(jwtToken)

            if (!hasEssentialData) {
                return false
            }

            const jwtExpiration = storage.getString(storageKeys().account.jwt.expiration)
            if (jwtExpiration) {
                const expirationDate = new Date(jwtExpiration)
                const now = new Date()

                if (expirationDate <= now) {
                    return false
                }
            }

            return true
        } catch (error) {
            console.error("❌ Erro ao verificar status de autenticação:", error)
            return false
        }
    }

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
                setErrorMessage,
                checkIsSigned,
                signIn,
                signOut,
                signUp,
            }}
        >
            <PersistedProvider>
                <PersistedConsumerBinder />
                {children}
            </PersistedProvider>
        </AuthContext.Provider>
    )
}

export default AuthContext
