import AuthContext from "@/contexts/Auth"
import { RedirectContext } from "@/contexts/redirect"
import React from "react"
import LoadingScreen from "../pages/auth/Loading"
import AppRoute from "./app.routes"
import AuthRoute from "./auth.routes"

export default function Routes() {
    const { checkIsSigned } = React.useContext(AuthContext)
    const { redirectTo, setRedirectTo } = React.useContext(RedirectContext)

    // Verifica na montagem
    React.useEffect(() => {
        const isAuthenticated = checkIsSigned()
        setRedirectTo(isAuthenticated ? "APP" : "AUTH")
    }, [])

    if (!redirectTo) return <LoadingScreen />
    return redirectTo === "APP" ? <AppRoute /> : <AuthRoute />
}
