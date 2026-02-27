import React, { useState } from "react"
import { AppState } from "react-native"
import DeviceInfo from "react-native-device-info"

import { apiRoutes, beginAuthGracePeriod } from "@/api"
import { storage, storageKeys } from "@/store"
import { useUserStore } from "@/contexts/Persisted/persist.user"
import { useAccountStore } from "@/contexts/Persisted/persist.account"
import { useMetricsStore } from "@/contexts/Persisted/persist.metrics"
import { usePreferencesStore } from "@/contexts/Persisted/persist.preferences"
import PersistedContext, { Provider as PersistedProvider } from "@/contexts/Persisted"
import { RedirectContext } from "@/contexts/redirect"
import { SessionDataType } from "@/contexts/Persisted/types"
import { signWithAppleProps } from "@/api/auth/auth.types"
import { trackAppOpen, trackAppClose, trackLogin, trackLogout } from "@/lib/trackEvent"

type AuthProviderProps = { children: React.ReactNode }

export type AuthContextsData = {
    loading: boolean
    isAuthenticating: boolean
    errorMessage: string
    signInputUsername: string
    signInputPassword: string
    sessionData: SessionDataType | null
    ageConfirmation: boolean
    signIn: () => Promise<void>
    signUp: () => Promise<void>
    appleSignUp: () => Promise<boolean>
    checkAppleAccountExists: (userOverride?: string) => Promise<{
        success: boolean
        exists: boolean
        flow: "signin" | "signup"
    }>
    appleSignIn: (override?: Partial<signWithAppleProps>) => Promise<void>
    signOut(): void
    checkIsSigned: () => boolean
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>
    setSignInputPassword: React.Dispatch<React.SetStateAction<string>>
    setSignInputUsername: React.Dispatch<React.SetStateAction<string>>
    setAppleSignData: React.Dispatch<React.SetStateAction<signWithAppleProps>>
    setAgeConfirmation: React.Dispatch<React.SetStateAction<boolean>>
}

const AuthContext = React.createContext<AuthContextsData>({} as AuthContextsData)

export function Provider({ children }: AuthProviderProps) {
    const { setRedirectTo } = React.useContext(RedirectContext)
    const [signInputUsername, setSignInputUsername] = React.useState("")
    const [signInputPassword, setSignInputPassword] = React.useState("")
    const [appleSignData, setAppleSignData] = React.useState({} as signWithAppleProps)
    const [ageConfirmation, setAgeConfirmation] = React.useState(true)
    const [sessionData, setSessionData] = useState<SessionDataType | null>(null)
    const [loading, setLoading] = useState(false)
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    React.useEffect(() => {
        const getUsername = () =>
            (storage.getString(storageKeys().user.username) || signInputUsername || "").toString()

        // track app opened on mount
        trackAppOpen(getUsername())

        const handler = (nextState: string) => {
            if (nextState === "active") {
                trackAppOpen(getUsername())
            } else if (nextState === "inactive" || nextState === "background") {
                trackAppClose(getUsername())
            }
        }

        const sub = AppState.addEventListener("change", handler)
        return () => {
            try {
                sub?.remove()
            } catch {}
            // provider unmount: consider app closing
            trackAppClose(getUsername())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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

    // Intermediary route to check if the Apple account already exists
    const checkAppleAccountExists = async (
        userOverride?: string,
    ): Promise<{
        success: boolean
        exists: boolean
        flow: "signin" | "signup"
    }> => {
        try {
            const userId = String(userOverride ?? appleSignData?.user ?? "")
            if (!userId) {
                setErrorMessage("Identificador Apple ausente. Tente novamente.")
                return { success: false, exists: false, flow: "signup" }
            }
            setErrorMessage("")
            setIsAuthenticating(true)
            setLoading(true)
            const res = await apiRoutes.auth.signWithAppleAlreadyExists(
                { user: userId },
                {
                    "forwarded-for": await DeviceInfo.getIpAddress(),
                    "machine-id": await DeviceInfo.getUniqueId(),
                    "Content-Type": "application/json",
                },
            )
            const data = res?.data || {}
            const exists = Boolean(data.exists)
            const flow: "signin" | "signup" = exists ? "signin" : "signup"
            return { success: Boolean(data.success ?? true), exists, flow }
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Não foi possível verificar a existência da conta Apple."
            setErrorMessage(String(msg))
            return { success: false, exists: false, flow: "signup" }
        } finally {
            setIsAuthenticating(false)
            setLoading(false)
        }
    }

    const appleSignUp = async () => {
        // Validações de entrada
        const fallbackUsername =
            (signInputUsername || "").trim() || String(appleSignData?.user || "")
        if (!fallbackUsername) {
            setErrorMessage("Usuário é obrigatório")
            return false
        }
        if (
            !appleSignData ||
            !appleSignData.authorizationCode ||
            !appleSignData.identityToken ||
            !appleSignData.user
        ) {
            setErrorMessage(
                "Credenciais do Apple inválidas ou ausentes. Tente novamente realizar o login com a Apple.",
            )
            return
        }

        // Sanitização de fullName (opcional nos providers da Apple)
        const safeFullName = {
            givenName: appleSignData.fullName?.givenName || "",
            familyName: appleSignData.fullName?.familyName || "",
        }

        setErrorMessage("")
        setIsAuthenticating(true)
        setLoading(true)
        try {
            const response = await apiRoutes.auth.signWithApple(
                {
                    username: fallbackUsername,
                    appleSign: {
                        authorizationCode: String(appleSignData.authorizationCode),
                        identityToken: String(appleSignData.identityToken),
                        fullName: safeFullName,
                        realUserStatus:
                            typeof appleSignData.realUserStatus === "number"
                                ? appleSignData.realUserStatus
                                : 0,
                        user: String(appleSignData.user),
                    },
                },
                {
                    "terms-accepted": "true",
                    "forwarded-for": await DeviceInfo.getIpAddress(),
                    "machine-id": await DeviceInfo.getUniqueId(),
                    moreThanSixteenYearsOld: ageConfirmation.toString(),
                    timezone: detectTimezoneHeader(),
                    latitude: "0",
                    longitude: "0",
                    device: "mobile",
                    "Content-Type": "application/json",
                },
            )

            if (!response?.data?.session) {
                throw new Error("Resposta inválida do servidor")
            }

            const sessionPayload = response.data.session

            await injectRef.current?.({ session: sessionPayload })
            storage.set("@circle:sessionId", sessionPayload.user?.id ?? "")
            return true
        } catch (error: any) {
            console.error("❌ Erro no login com Apple:", error)

            let errorMsg = "Erro interno do servidor"
            if (error?.response?.data?.message) {
                errorMsg = String(error.response.data.message).split(". ")[0]
            } else if (error?.message) {
                errorMsg = error.message
            }

            // Mensagens específicas quando campos críticos estiverem ausentes
            if (
                !appleSignData.authorizationCode ||
                !appleSignData.identityToken ||
                !appleSignData.user
            ) {
                errorMsg =
                    "Não foi possível validar suas credenciais Apple. Por favor, tente novamente."
            }

            setErrorMessage(errorMsg)
            return false
        } finally {
            setIsAuthenticating(false)
            setLoading(false)
        }
    }

    // Apple Sign-In flow (when backend indicates the account already exists)
    const appleSignIn = async (override?: Partial<signWithAppleProps>) => {
        const merged = { ...appleSignData, ...(override || {}) }
        if (!merged || !merged.authorizationCode || !merged.identityToken || !merged.user) {
            setErrorMessage(
                "Credenciais do Apple inválidas ou ausentes. Tente novamente realizar o login com a Apple.",
            )
            return
        }

        // Username may not be necessary for sign-in; send the Apple user as username fallback
        const usernameForSignIn = signInputUsername.trim() || String(merged.user)

        setErrorMessage("")
        setIsAuthenticating(true)
        setLoading(true)

        try {
            const response = await apiRoutes.auth.signWithApple(
                {
                    username: usernameForSignIn,
                    appleSign: {
                        authorizationCode: String(merged.authorizationCode),
                        identityToken: String(merged.identityToken),
                        fullName: {
                            givenName: merged.fullName?.givenName || "",
                            familyName: merged.fullName?.familyName || "",
                        },
                        realUserStatus:
                            typeof merged.realUserStatus === "number" ? merged.realUserStatus : 0,
                        user: String(merged.user),
                    },
                },
                {
                    "forwarded-for": await DeviceInfo.getIpAddress(),
                    "machine-id": await DeviceInfo.getUniqueId(),
                    timezone: detectTimezoneHeader(),
                    latitude: "0",
                    longitude: "0",
                    device: "mobile",
                    "Content-Type": "application/json",
                },
            )

            if (!response?.data?.session) {
                throw new Error("Resposta inválida do servidor")
            }

            const sessionPayload = response.data.session
            await injectRef.current?.({ session: sessionPayload })
            storage.set("@circle:sessionId", sessionPayload.user?.id ?? "")
            trackLogin(String(sessionPayload.user?.username || usernameForSignIn || ""))
            setRedirectTo("APP")
            beginAuthGracePeriod(1000)
        } catch (error: any) {
            let errorMsg = "Erro interno do servidor"
            if (error?.response?.data?.message) {
                errorMsg = String(error.response.data.message).split(". ")[0]
            } else if (error?.message) {
                errorMsg = error.message
            }
            setErrorMessage(errorMsg)
        } finally {
            setIsAuthenticating(false)
            setLoading(false)
        }
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
            trackLogin(String(sessionPayload.user?.username || signInputUsername.trim() || ""))
            setRedirectTo("APP")
            beginAuthGracePeriod(1000)
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
            beginAuthGracePeriod(1000)
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
            // Limpa stores persistidas
            try {
                useUserStore().remove()
                useAccountStore().remove()
                usePreferencesStore().remove()
                useMetricsStore().remove()
            } catch (e) {
                console.warn("Erro ao limpar stores:", e)
            }

            // Limpa dados do usuário e tokens, preservando chaves de tutorial
            try {
                const username = storage.getString(storageKeys().user.username) || ""
                trackLogout(username)
            } catch {}
            // storage.clearAll() removido para preservar chaves de tutorial (MMKV)
            try {
                const { clearSessionDataPreservingTutorial } = require("@/store")
                if (typeof clearSessionDataPreservingTutorial === "function") {
                    clearSessionDataPreservingTutorial()
                }
            } catch {}

            // Reseta estados locais
            setSessionData(null)
            setSignInputUsername("")
            setSignInputPassword("")
            setErrorMessage("")

            // Redireciona para AUTH
            setRedirectTo("AUTH")
        } catch (error) {
            console.error("Erro no logout:", error)
            setRedirectTo("AUTH")
        }
    }

    const checkIsSigned = (): boolean => {
        try {
            const jwtToken = storage.getString(storageKeys().account.jwt.token)
            if (!jwtToken) {
                console.log("checkIsSigned: missing jwtToken")
                return false
            }

            // Opcional: Log apenas se token estiver próximo de expirar (para debug)
            const jwtExpiration = storage.getString(storageKeys().account.jwt.expiration)
            if (jwtExpiration) {
                const expirationDate = new Date(jwtExpiration)
                const now = new Date()
                const minutesUntilExpiration =
                    (expirationDate.getTime() - now.getTime()) / 1000 / 60

                if (minutesUntilExpiration < 5 && minutesUntilExpiration > 0) {
                    console.log("Token expira em menos de 5 minutos, refresh será automático")
                }
            }

            return true
        } catch (error) {
            console.error("Erro ao verificar status de autenticação:", error)
            return false
        }
    }

    return (
        <AuthContext.Provider
            value={{
                loading,
                isAuthenticating,
                errorMessage,
                ageConfirmation,
                sessionData,
                signInputPassword,
                signInputUsername,
                setSignInputPassword,
                setSignInputUsername,
                setAppleSignData,
                setAgeConfirmation,
                setErrorMessage,
                checkIsSigned,
                checkAppleAccountExists,
                appleSignIn,
                signIn,
                appleSignUp,
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
