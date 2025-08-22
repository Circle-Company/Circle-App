import React, { useState } from "react"
import { Platform } from "react-native"
import {
    getDeviceId,
    getDeviceName,
    getDeviceToken,
    getIpAddress,
    getMacAddress,
    getTotalDiskCapacity,
    getUniqueId,
} from "react-native-device-info"
import api from "../../services/Api"
import { storage, storageKeys } from "../../store"
import { SessionDataType } from "../Persisted/types"
import { RedirectContext } from "../redirect"

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

export function Provider({ children }: AuthProviderProps) {
    const { setRedirectTo } = React.useContext(RedirectContext)
    const [signInputUsername, setSignInputUsername] = React.useState("")
    const [signInputPassword, setSignInputPassword] = React.useState("")
    const [sessionData, setSessionData] = useState<SessionDataType>({} as SessionDataType)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    async function signIn() {
        setErrorMessage("")
        setLoading(true)

        await api
            .post("/auth/sign-in", { username: signInputUsername, password: signInputPassword })
            .then((response) => {
                const data = response.data.session
                setSessionData({
                    user: data.user,
                    account: data.account,
                    preferences: data.preferences,
                    statistics: data.statistics,
                    history: data.history,
                })
                setRedirectTo("APP")
            })
            .finally(() => {
                setLoading(false)
            })
            .catch((err) => {
                setSessionData({} as SessionDataType)
                setLoading(false)
                console.error("SignIn Error:", err)
                if (err.response.status === 400) {
                    setErrorMessage("Invalid username or password.")
                } else if (err.response.status === 403) {
                    setErrorMessage("Your account is not active.")
                } else {
                    setErrorMessage("An unexpected error occurred. Please try again later.")
                }
            })
    }

    async function signUp() {
        setErrorMessage("")
        setLoading(true)

        const signData = {
            sign: {
                username: signInputUsername,
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

        await api
            .post("/auth/sign-up", signData)
            .then((response) => {
                storage.set("@circle:sessionId", response.data.session.user.id.toString())
                storage.set(storageKeys().account.jwt.token, response.data.session.account.jwtToken)
                console.log("Session Data", response.data.session)
                setSessionData(response.data.session)
            })
            .finally(() => {
                setLoading(false)
                setRedirectTo("APP")
            })
            .catch((err) => {
                setErrorMessage(err.response.data.message.split(". ")[0])
            })
    }

    async function getSessionData() {}

    function signOut() {
        storage.clearAll()
        setSessionData({} as SessionDataType)
        setRedirectTo("AUTH")
    }

    function checkIsSigned() {
        const hasSessionId = storage.getAllKeys().map((key) => {
            if (key === "@circle:sessionId") return true
            else return false
        })
        if (storage.getString(storageKeys().user.id) && hasSessionId) return true
        else return false
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
