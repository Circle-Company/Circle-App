import { Dimensions, Platform } from "react-native"
import { PERMISSIONS, RESULTS, check, request } from "react-native-permissions"
import React, { useEffect, useState } from "react"
import { storage, storageKeys } from "../../store"

import DeviceInfo from "react-native-device-info"
import { Provider as PersistedProvider } from "../Persisted"
import { RedirectContext } from "../redirect"
import { SessionDataType } from "../Persisted/types"
import api from "../../services/Api"

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

// Função de validação de dados de sessão
function isValidSessionPayload(data: any): boolean {
    return (
        data &&
        typeof data === "object" &&
        typeof data.token === "string" &&
        typeof data.expiresIn === "number" &&
        data.user &&
        typeof data.user === "object" &&
        typeof data.user.id === "string" &&
        typeof data.user.username === "string" &&
        data.status &&
        typeof data.status === "object" &&
        data.preferences &&
        typeof data.preferences === "object"
    )
}

function normalizeSessionPayload(payload: any): SessionDataType {
    const expiresIn = typeof payload.expiresIn === "number" ? payload.expiresIn : 0
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    const user = payload.user ?? {}
    const status = payload.status ?? {}
    const preferencesPayload = payload.preferences ?? {}

    // Mapear preferências do formato plano para estrutura aninhada
    const preferences = {
        appTimezone: preferencesPayload.appTimezone ?? 0,
        timezoneCode: preferencesPayload.timezoneCode ?? "",
        language: {
            appLanguage: preferencesPayload.appLanguage ?? "pt",
            translationLanguage: preferencesPayload.translationLanguage ?? "pt",
        },
        content: {
            disableAutoplay: Boolean(preferencesPayload.disableAutoplay ?? false),
            disableHaptics: Boolean(preferencesPayload.disableHaptics ?? false),
            disableTranslation: Boolean(preferencesPayload.disableTranslation ?? false),
            muteAudio: Boolean(preferencesPayload.muteAudio ?? false),
        },
        pushNotifications: {
            disableLikeMoment: Boolean(
                preferencesPayload.disableLikeMomentPushNotification ?? false,
            ),
            disableNewMemory: Boolean(preferencesPayload.disableNewMemoryPushNotification ?? false),
            disableAddToMemory: Boolean(
                preferencesPayload.disableAddToMemoryPushNotification ?? false,
            ),
            disableFollowUser: Boolean(
                preferencesPayload.disableFollowUserPushNotification ?? false,
            ),
            disableViewUser: Boolean(preferencesPayload.disableViewUserPushNotification ?? false),
        },
    }

    const account = {
        jwtToken: payload.token ?? "",
        jwtExpiration: expiresAt,
        refreshToken: payload.refreshToken ?? undefined,
        blocked: Boolean(status.blocked ?? false),
        muted: Boolean(status.muted ?? false),
        unreadNotificationsCount: 0,
        accessLevel: status.accessLevel ?? "",
        verified: Boolean(status.verified ?? false),
        deleted: Boolean(status.deleted ?? false),
        createdAt: status.createdAt ?? "",
        updatedAt: status.updatedAt ?? "",
        last_active_at: status.updatedAt ?? "",
        last_login_at: status.updatedAt ?? "",
        coordinates: {
            latitude: 0,
            longitude: 0,
        },
    }

    const securityInfo = payload.securityInfo
        ? {
              riskLevel: payload.securityInfo.riskLevel ?? "",
              status: payload.securityInfo.status ?? "",
              message: payload.securityInfo.message ?? "",
              additionalData: payload.securityInfo.additionalData ?? undefined,
          }
        : undefined

    const normalized: SessionDataType = {
        token: payload.token ?? "",
        expiresIn,
        expiresAt,
        user: {
            id: user.id ?? "",
            username: user.username ?? "",
            name: user.name ?? null,
            description: user.description ?? null,
            richDescription: user.richDescription ?? null,
            isVerified: Boolean(user.isVerified ?? false),
            isActive: Boolean(user.isActive ?? false),
            profilePicture: user.profilePicture ?? null,
        },
        status: {
            accessLevel: status.accessLevel ?? "",
            verified: Boolean(status.verified ?? false),
            deleted: Boolean(status.deleted ?? false),
            blocked: Boolean(status.blocked ?? false),
            muted: Boolean(status.muted ?? false),
            createdAt: status.createdAt ?? "",
            updatedAt: status.updatedAt ?? "",
        },
        preferences,
        securityInfo,
        account,
    }

    return normalized
}

// Função utilitária para persistir dados de sessão
const persistSessionData = (session: SessionDataType) => {
    try {
        console.log("💾 Persistindo dados de sessão...")

        const keys = storageKeys()
        const safeSet = (key: string, value: any) => {
            if (value !== undefined && value !== null) {
                storage.set(key, value)
            } else {
                storage.delete(key)
            }
        }

        // Persistir dados do usuário
        const userKey = keys.user
        safeSet(userKey.id, session.user.id)
        safeSet(userKey.username, session.user.username)
        safeSet(userKey.name, session.user.name ?? "")
        safeSet(userKey.description, session.user.description ?? "")
        safeSet(userKey.description + ":rich", session.user.richDescription ?? "")
        safeSet(userKey.verified, session.user.isVerified)
        safeSet(userKey.verified + ":active", session.user.isActive)
        if (session.user.profilePicture) {
            safeSet(userKey.profile_picture.small, session.user.profilePicture)
        } else {
            storage.delete(userKey.profile_picture.small)
        }

        // Persistir dados da conta
        const accountKey = keys.account
        const statusKeyPrefix = `${keys.baseKey}account:status:`

        safeSet(accountKey.jwt.token, session.account.jwtToken)
        safeSet(accountKey.jwt.expiration, session.account.jwtExpiration)
        safeSet(accountKey.jwt.refreshToken, session.account.refreshToken ?? "")
        safeSet(accountKey.blocked, session.account.blocked)
        safeSet(accountKey.muted, session.account.muted)
        safeSet(accountKey.last_active_at, session.account.last_active_at)
        safeSet(accountKey.last_login_at, session.account.last_login_at)
        safeSet(`${statusKeyPrefix}accesslevel`, session.account.accessLevel)
        safeSet(`${statusKeyPrefix}verified`, session.account.verified)
        safeSet(`${statusKeyPrefix}deleted`, session.account.deleted)
        safeSet(`${statusKeyPrefix}createdat`, session.account.createdAt)
        safeSet(`${statusKeyPrefix}updatedat`, session.account.updatedAt)
        if (session.account.coordinates) {
            safeSet(accountKey.coordinates.latitude, session.account.coordinates.latitude)
            safeSet(accountKey.coordinates.longitude, session.account.coordinates.longitude)
        }

        // Persistir preferências
        const preferencesKey = keys.preferences
        safeSet(preferencesKey.appLanguage, session.preferences.language.appLanguage)
        safeSet(
            preferencesKey.translationLanguage,
            session.preferences.language.translationLanguage,
        )
        safeSet(preferencesKey.autoplay, session.preferences.content.disableAutoplay)
        safeSet(preferencesKey.haptics, session.preferences.content.disableHaptics)
        safeSet(preferencesKey.translation, session.preferences.content.disableTranslation)
        safeSet(preferencesKey.muteAudio, session.preferences.content.muteAudio)
        safeSet(preferencesKey.likeMoment, session.preferences.pushNotifications.disableLikeMoment)
        safeSet(preferencesKey.newMemory, session.preferences.pushNotifications.disableNewMemory)
        safeSet(
            preferencesKey.addToMemory,
            session.preferences.pushNotifications.disableAddToMemory,
        )
        safeSet(preferencesKey.followUser, session.preferences.pushNotifications.disableFollowUser)
        safeSet(preferencesKey.viewUser, session.preferences.pushNotifications.disableViewUser)
        // appTimezone e timezoneCode serão persistidos pelo PreferencesStore quando necessário

        // Persistir sessionId
        safeSet("@circle:sessionId", session.user.id)

        console.log("✅ Dados persistidos no storage com sucesso")
        return true
    } catch (error) {
        console.error("❌ Erro ao persistir dados:", error)
        return false
    }
}

export function Provider({ children }: AuthProviderProps) {
    const { setRedirectTo } = React.useContext(RedirectContext)
    const [signInputUsername, setSignInputUsername] = React.useState("")
    const [signInputPassword, setSignInputPassword] = React.useState("")
    const [sessionData, setSessionData] = useState<SessionDataType | null>(null)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

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
            const response = await api.post(
                "/auth/signin",
                {
                    username: signInputUsername.trim(),
                    password: signInputPassword,
                },
                {
                    headers: {
                        "terms-accepted": "true",
                        "forwarded-for": await DeviceInfo.getIpAddress(),
                        "machine-id": await DeviceInfo.getUniqueId(),
                        timezone: detectTimezoneHeader(),
                        latitude: 0,
                        longitude: 0,
                        device: "mobile",
                        "Content-Type": "application/json",
                    },
                },
            )

            if (!response.data || !response.data.session) {
                throw new Error("Resposta inválida do servidor")
            }

            const sessionPayload = response.data.session

            if (!isValidSessionPayload(sessionPayload)) {
                throw new Error("Dados de sessão inválidos")
            }

            const normalizedSession = normalizeSessionPayload(sessionPayload)

            setSessionData(normalizedSession)
            persistSessionData(normalizedSession)
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
            const [deviceId, deviceName, totalDiskCapacity, macAddress, ipAddress] =
                await Promise.all([
                    DeviceInfo.getUniqueId().catch(() => "unknown"),
                    DeviceInfo.getDeviceName().catch(() => "unknown"),
                    DeviceInfo.getTotalDiskCapacity()
                        .then((capacity) => capacity?.toString() || "unknown")
                        .catch(() => "unknown"),
                    DeviceInfo.getMacAddress().catch(() => "00:00:00:00:00:00"),
                    DeviceInfo.getIpAddress().catch(() => "127.0.0.1"),
                ])

            const osVersion = DeviceInfo.getSystemVersion()
            const hasNotch = DeviceInfo.hasNotch()
            const screenResolution = Dimensions.get("screen")

            const signData = {
                username: signInputUsername.trim(),
                password: signInputPassword,
                metadata: {
                    device_id: deviceId,
                    device_type: Platform.OS === "android" ? "android" : "ios",
                    device_name: deviceName,
                    device_token: deviceId,
                    os_language: "pt-BR",
                    os_version: osVersion,
                    total_device_memory: totalDiskCapacity,
                    screen_resolution_width: screenResolution.width,
                    screen_resolution_height: screenResolution.height,
                    has_notch: hasNotch,
                    unique_id: deviceId,
                },
                location_info: {
                    ip_address: ipAddress || "127.0.0.1",
                    mac_address: macAddress || "00:00:00:00:00:00",
                    country: "BR",
                    state: "SP",
                    city: "São Paulo",
                    zone: "America/Sao_Paulo",
                },
            }

            console.log("📤 Enviando dados de cadastro:", JSON.stringify(signData, null, 2))

            const response = await api.post("/auth/sign-up", signData)
            if (!response.data || !response.data.session) {
                throw new Error("Resposta inválida do servidor")
            }

            const sessionPayload = response.data.session

            if (!isValidSessionPayload(sessionPayload)) {
                throw new Error("Dados de sessão inválidos")
            }

            const normalizedSession = normalizeSessionPayload(sessionPayload)

            setSessionData(normalizedSession)
            persistSessionData(normalizedSession)
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
    }

    const signOut = () => {
        try {
            storage.clearAll()
            setSessionData(null)
            setSignInputUsername("")
            setSignInputPassword("")
            setErrorMessage("")
            delete api.defaults.headers.common.Authorization
            setRedirectTo("AUTH")
            // Limpa stores persistidas do usuário
            try {
                const {
                    useUserStore,
                    useAccountStore,
                    usePreferencesStore,
                    useStatisticsStore,
                    useHistoryStore,
                } = require("../Persisted/persistedUser")
                useUserStore().remove()
                useAccountStore().remove()
                usePreferencesStore().remove()
                useStatisticsStore().remove()
                useHistoryStore().remove()
            } catch (e) {
                console.warn("⚠️ Não foi possível limpar stores persistidas do usuário:", e)
            }
            console.log("✅ Logout realizado com sucesso")
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

            console.log("🔍 Verificando dados de autenticação:")
            console.log("  - SessionId:", sessionId ? "✅" : "❌")
            console.log("  - UserId:", userId ? "✅" : "❌")
            console.log("  - JwtToken:", jwtToken ? "✅" : "❌")

            const hasEssentialData = sessionId && userId && jwtToken

            if (!hasEssentialData) {
                console.log("❌ Dados essenciais ausentes")
                return false
            }

            const jwtExpiration = storage.getString(storageKeys().account.jwt.expiration)
            if (jwtExpiration) {
                const expirationDate = new Date(jwtExpiration)
                const now = new Date()

                console.log("🔍 Verificando expiração JWT:")
                console.log("  - Expiração:", jwtExpiration)
                console.log("  - Data atual:", now.toISOString())
                console.log("  - Token válido:", expirationDate > now ? "✅" : "❌")

                if (expirationDate <= now) {
                    console.log("⚠️ JWT expirado")
                    return false
                }
            }

            console.log("✅ Usuário autenticado com sucesso")
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
            <PersistedProvider>{children}</PersistedProvider>
        </AuthContext.Provider>
    )
}

export default AuthContext
