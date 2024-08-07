import React, { useState } from "react"
import { notify } from "react-native-notificated"
import ErrorIcon from "../assets/icons/svgs/exclamationmark_circle.svg"
import { colors } from "../layout/constants/colors"
import api from "../services/Api"
import { storage } from "../store"
import { storageKeys } from "./Persisted/storageKeys"
import { SessionDataType } from "./Persisted/types"
import LanguageContext from "./Preferences/language"

type AuthProviderProps = { children: React.ReactNode }

export type AuthContextsData = {
    signInputUsername: string
    signInputPassword: string
    sessionData: SessionDataType
    jwtToken: string | null
    getSessionData: ({ sessionId }: { sessionId: string }) => Promise<void>
    refreshJwtToken: ({ username, id }: { username: string; id: number }) => Promise<void>
    signIn: () => Promise<void>
    signUp: () => Promise<void>
    signOut(): void
    checkIsSigned: () => boolean
    setSignInputPassword: React.Dispatch<React.SetStateAction<string>>
    setSignInputUsername: React.Dispatch<React.SetStateAction<string>>
}

const AuthContext = React.createContext<AuthContextsData>({} as AuthContextsData)

export function Provider({ children }: AuthProviderProps) {
    const { t } = React.useContext(LanguageContext)
    const [signInputUsername, setSignInputUsername] = React.useState("")
    const [signInputPassword, setSignInputPassword] = React.useState("")
    const [sessionData, setSessionData] = useState<SessionDataType>({} as SessionDataType)
    const [jwtToken, setJwtToken] = useState<string | null>(null)

    async function signIn() {
        await api
            .post("/auth/sign-in", { username: signInputUsername, password: signInputPassword })
            .then((response) => {
                setSessionData(response.data.session)
                setJwtToken(response.data.access_token)
                const userId = response.data.session.id
                if (userId) storage.set("@circle:sessionId", Number(userId))
            })
            .catch((err) => {
                notify("toast", {
                    params: {
                        description: err.message,
                        title: t("Error"),
                        icon: (
                            <ErrorIcon fill={colors.red.red_05.toString()} width={15} height={15} />
                        ),
                    },
                })
            })
    }

    async function signUp() {
        await api
            .post("/auth/sign-up", { username: signInputUsername, password: signInputPassword })
            .then((response) => {
                setSessionData(response.data.session)
                setJwtToken(response.data.access_token)
                const userId = response.data.session.id
                if (userId) storage.set("@circle:sessionId", Number(userId))
            })
            .catch((err) => {
                notify("toast", {
                    params: {
                        description: err.message,
                        title: t("Error"),
                        icon: (
                            <ErrorIcon fill={colors.red.red_05.toString()} width={15} height={15} />
                        ),
                    },
                })
            })
    }

    async function getSessionData() {}

    function signOut() {
        storage.clearAll()
        setSessionData({} as SessionDataType)
        setJwtToken(null)
    }

    function checkIsSigned() {
        const hasSessionId = storage.getAllKeys().map((key) => {
            if (key == "@circle:sessionId") return true
            else return false
        })
        if (storage.getNumber(storageKeys().user.id) && hasSessionId) return true
        else return false
    }

    async function refreshJwtToken({ username, id }: { username: string; id: number }) {
        const response = await api.post("/auth/refresh-token", { username, id })
        setJwtToken(response.data.access_token)
    }

    return (
        <AuthContext.Provider
            value={{
                jwtToken,
                sessionData,
                signInputPassword,
                signInputUsername,
                refreshJwtToken,
                setSignInputPassword,
                setSignInputUsername,
                getSessionData,
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
