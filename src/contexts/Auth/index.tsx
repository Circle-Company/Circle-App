import { SessionDataType } from "@/contexts/Persisted/types"
import api from "../../services/Api"
import { storage, storageKeys } from "@/store"
import React, { useState } from "react"
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
                storage.set("@circle:sessionId", response.data.session.user.id.toString())
                setSessionData(response.data.session)
                setRedirectTo("APP")
            })
            .finally(() => {
                setLoading(false)
            })
            .catch((err) => {
                setErrorMessage(err.response.data.message.split(". ")[0])
            })
    }

    async function signUp() {
        setErrorMessage("")
        setLoading(true)

        await api
            .post("/auth/sign-up", { username: signInputUsername, password: signInputPassword })
            .then((response) => {
                storage.set("@circle:sessionId", response.data.session.user.id.toString())
                setSessionData(response.data.session)
                setRedirectTo("APP")
            })
            .finally(() => {
                setLoading(false)
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
            if (key == "@circle:sessionId") return true
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
