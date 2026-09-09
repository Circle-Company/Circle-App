import React, { useState } from "react"
import { AppState } from "react-native"
import DeviceInfo from "react-native-device-info"

import { apiRoutes, onSessionExpired, resetSessionExpiredLatch } from "@/api"
import { storage, storageKeys } from "@/store"
import { useMetricsStore } from "@/contexts/Persisted/metrics"
import { useAccountStore } from "@/contexts/Persisted/account"
import PersistedContext, { Provider as PersistedProvider } from "@/contexts/Persisted"
import { RedirectContext } from "@/contexts/redirect"
import { recordLogin, resetSessionRuntime } from "@/session/runtime"
import { installForegroundRevalidation } from "@/session/foreground"
import { clearResidualDataIfDifferentPerson } from "@/session/identityGuard"
import { SessionDataType } from "@/contexts/Persisted/types"
import { signWithAppleProps } from "@/api/auth/auth.types"
import { trackAppOpen, trackAppClose, trackLogin, trackLogout } from "@/lib/trackEvent"

type AuthProviderProps = { children: React.ReactNode }

export type AuthContextsData = {
    loading: boolean
    isAuthenticating: boolean
    errorMessage: string
    signInputUsername: string
    sessionData: SessionDataType | null
    ageConfirmation: boolean
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
    setSignInputUsername: React.Dispatch<React.SetStateAction<string>>
    setAppleSignData: React.Dispatch<React.SetStateAction<signWithAppleProps>>
    setAgeConfirmation: React.Dispatch<React.SetStateAction<boolean>>
}

const AuthContext = React.createContext<AuthContextsData>({} as AuthContextsData)

export function Provider({ children }: AuthProviderProps) {
    const { setRedirectTo } = React.useContext(RedirectContext)
    const [signInputUsername, setSignInputUsername] = React.useState("")
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

    // A barreira de revalidação (§5.5). Montada uma vez, no provider que já é a raiz da
    // sessão: na volta do background as requests esperam a decisão em vez de saírem com um
    // token morto e voltarem 401 em rajada — que é o §0.1 inteiro.
    React.useEffect(() => installForegroundRevalidation(), [])

    const injectRef = React.useRef<null | ((session: any) => Promise<void>)>(null)

    const PersistedConsumerBinder = () => {
        const { injectAuthSession } = React.useContext(PersistedContext)
        React.useEffect(() => {
            injectRef.current = injectAuthSession
        }, [injectAuthSession])
        return null
    }

    /**
     * Persiste a sessão e **confirma** que o token chegou ao MMKV.
     *
     * Sem essa confirmação, um payload de login em formato inesperado passava
     * batido: `injectAuthSession` não achava `token`/`refreshToken`, gravava
     * nada, e o app navegava para a área autenticada mesmo assim. Dali em
     * diante todo request saía sem header, voltava 401, o refresh não tinha o
     * que renovar, e a tela ficava preta indefinidamente.
     */
    const persistSession = async (sessionPayload: any, appleUserId?: string) => {
        // ANTES de gravar a sessão nova (§2.6): se quem está entrando não é quem o device
        // lembra, o dado por-usuário residual — likes, notificações lidas, métricas — é de
        // outra pessoa e não pode ser herdado. A limpeza rodava só no logout, e quem troca
        // de conta sem deslogar nunca passava por ela.
        const identity = clearResidualDataIfDifferentPerson({
            appleUserId,
            userId: sessionPayload?.user?.id ? String(sessionPayload.user.id) : undefined,
        })
        if (identity.isDifferentPerson) {
            console.warn("🧹 Conta diferente neste aparelho — dado residual limpo", identity.reason)
        }

        await injectRef.current?.({ session: sessionPayload })

        const keys = storageKeys().account.jwt
        if (!storage.getString(keys.token)) {
            // Loga as chaves (não os valores) para identificar o formato real
            // devolvido pelo backend sem vazar credencial no console.
            console.error(
                "❌ Login não persistiu o token",
                JSON.stringify({ sessionKeys: Object.keys(sessionPayload ?? {}) }),
            )
            throw new Error("Sessão inválida: o servidor não retornou o token de acesso")
        }

        if (!storage.getString(keys.refreshToken)) {
            console.warn("⚠️ Login sem refreshToken — a sessão não poderá ser renovada")
        }

        // Grava o blob da sessão com a âncora do Apple. É o que dá ao device memória de
        // **quem** entrou — sem isso o guard acima nunca teria com o que comparar no
        // próximo login, e o §5.8 nunca poderia oferecer "entrar como @fulano".
        recordLogin(appleUserId)

        // Nova sessão válida: rearma a notificação de expiração.
        resetSessionExpiredLatch()
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
            // `return` sem valor fazia o tipo virar `boolean | undefined`, e quem chama
            // trata o retorno como "deu certo?".
            return false
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

            await persistSession(sessionPayload, String(appleSignData?.user || ""))
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
            await persistSession(sessionPayload, String(merged?.user || ""))
            trackLogin(String(sessionPayload.user?.username || usernameForSignIn || ""))
            setRedirectTo("APP")
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

    const signOut = () => {
        // Capturado ANTES de qualquer limpeza: a chamada de despedida precisa do access
        // token no header, e estamos prestes a apagar o storage de onde ele sai.
        const accessToken = storage.getString(storageKeys().account.jwt.token)

        // Best-effort, sem `await`: o logout do usuário não pode esperar a rede. A revogação
        // no servidor é desejável — ela impede que a sessão se renove — mas o que efetiva o
        // logout do ponto de vista do usuário é a limpeza local, que acontece de qualquer
        // jeito logo abaixo.
        if (accessToken) {
            apiRoutes.auth.signOut(accessToken).catch(() => {
                // rede caiu, servidor fora: não muda nada aqui
            })
        }

        try {
            // Mata a sessão viva antes de tudo: sem isto, um refresh em voo poderia gravar
            // um par novo DEPOIS da limpeza, deixando o app com token de uma sessão que o
            // usuário acabou de encerrar.
            resetSessionRuntime()

            // Limpa as stores persistidas. Atenção ao `.getState()`: chamar `useAccountStore()`
            // aqui é invocar um hook fora de componente — o Zustand usa
            // `useSyncExternalStore` por baixo, então a chamada quebra em runtime e, dentro
            // deste try/catch, falhava em silêncio. O resultado era o logout limpar o MMKV
            // mas deixar os dados do usuário anterior vivos em memória.
            //
            // São três, e não quatro: `user` e `account` viraram um viewer só (§11.2), cujo
            // `clear()` zera memória e storage numa operação.
            try {
                useAccountStore.getState().clear()
                useMetricsStore.getState().clear()
                // `preferences` fica: é do aparelho, não da conta (§2.2).
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
            setErrorMessage("")

            // Redireciona para AUTH
            setRedirectTo("AUTH")
        } catch (error) {
            console.error("Erro no logout:", error)
            setRedirectTo("AUTH")
        }
    }

    // A camada de axios não alcança hooks nem router: quando ela detecta que a
    // sessão morreu (401 sem refresh possível), avisa por aqui. Sem esta ponte
    // o app continuava montado numa rota autenticada sem token — todo request
    // falhava e nenhuma tela renderizava.
    const signOutRef = React.useRef(signOut)
    signOutRef.current = signOut

    React.useEffect(() => {
        return onSessionExpired(() => {
            console.warn("🚪 Sessão expirada — deslogando")
            signOutRef.current()
        })
    }, [])

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
                signInputUsername,
                setSignInputUsername,
                setAppleSignData,
                setAgeConfirmation,
                setErrorMessage,
                checkIsSigned,
                checkAppleAccountExists,
                appleSignIn,
                appleSignUp,
                signOut,
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
