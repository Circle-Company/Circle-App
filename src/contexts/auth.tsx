import React, { useState } from "react"
import api from "../services/Api"
import { storage, storageKeys } from "../store"
import { SessionDataType } from "./Persisted/types"

type AuthProviderProps = { children: React.ReactNode }

export type AuthContextsData = {
    loading: boolean
    errorMessage: string
    signInputUsername: string
    signInputPassword: string
    sessionData: SessionDataType
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
    const [signInputUsername, setSignInputUsername] = React.useState("")
    const [signInputPassword, setSignInputPassword] = React.useState("")
    const [sessionData, setSessionData] = useState<SessionDataType>({} as SessionDataType)
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)
    async function signIn() {
        setErrorMessage("")
        setLoading(true)
        await api
            .post("/auth/sign-in", { username: signInputUsername, password: signInputPassword })
            .then((response) => {
                setSessionData(response.data.session)
                if (response.data.session.user.id)
                    storage.set(
                        storageKeys().account.jwt.token,
                        response.data.session.account.jwtToken.toString()
                    )
                storage.set("@circle:sessionId", response.data.session.user.id.toString())
            })
            .finally(() => {
                setLoading(false)
            })
            .catch((err) => {
                setErrorMessage(err.response.data.error)
            })
    }

    async function signUp() {
        setErrorMessage("")
        setLoading(true)
        await api
            .post("/auth/sign-up", { username: signInputUsername, password: signInputPassword })
            .then((response) => {
                setSessionData(response.data.session.user.id)
                if (response.data.session.user.id)
                    storage.set("@circle:sessionId", response.data.session.user.id.toString())
            })
            .finally(() => {
                setLoading(false)
            })
            .catch((err) => {
                setErrorMessage(err.response.data.error)
            })
    }

    function signOut() {
        storage.clearAll()
        setSessionData({} as SessionDataType)
    }

    function checkIsSigned() {
        const hasSessionId = storage.getAllKeys().map((key) => {
            if (key == "@circle:sessionId") return true
            else return false
        })
        if (storage.getNumber(storageKeys().user.id) && hasSessionId) return true
        else return false
    }
    return (
        <AuthContext.Provider
            value={{
                errorMessage,
                loading,
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
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
