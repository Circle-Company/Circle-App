import AuthContext from "@/contexts/Auth"
import { RedirectContext } from "@/contexts/redirect"
import LoadingScreen from "@/pages/auth/Loading"
import AppRoute from "@/routes/app.routes"
import AuthRoute from "@/routes/auth.routes"
import React from "react"

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
