import React, { useState } from "react"
import { notify } from "react-native-notificated"
import ErrorIcon from "../assets/icons/svgs/exclamationmark_circle.svg"
import { colors } from "../layout/constants/colors"
import api from "../services/Api"
import { storage, storageKeys } from "../store"
import { SessionDataType } from "./Persisted/types"
import LanguageContext from "./Preferences/language"

type AuthProviderProps = { children: React.ReactNode }

export type AuthContextsData = {
    loading: boolean
    signInputUsername: string
    signInputPassword: string
    sessionData: SessionDataType
    getSessionData: ({ sessionId }: { sessionId: string }) => Promise<void>
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
    const [loading, setLoading] = useState(false)
    async function signIn() {
        await api
            .post("/auth/sign-in", { username: signInputUsername, password: signInputPassword })
            .then((response) => {
                console.log(response.data)
                setLoading(true)
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
                setLoading(true)
                setSessionData(response.data.session.user.id)
                if (response.data.session.user.id)
                    storage.set("@circle:sessionId", response.data.session.user.id.toString())
            })
            .finally(() => {
                setLoading(false)
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
                loading,
                sessionData,
                signInputPassword,
                signInputUsername,
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
