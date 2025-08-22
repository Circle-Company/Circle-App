import React, { useEffect, useState } from "react"

import AppRoute from "./app.routes"
import AuthContext from "../contexts/Auth"
import AuthRoute from "./auth.routes"
import LoadingScreen from "../pages/auth/Loading"
import { RedirectContext } from "../contexts/redirect"

export default function Routes() {
    const { checkIsSigned, sessionData } = React.useContext(AuthContext)
    const { redirectTo, setRedirectTo } = React.useContext(RedirectContext)
    const [isInitializing, setIsInitializing] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Verificar autenticação na montagem e quando sessionData mudar
    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                console.log("🔍 Verificando autenticação...")

                const authenticated = checkIsSigned()
                setIsAuthenticated(authenticated)

                if (authenticated) {
                    console.log("✅ Usuário autenticado, redirecionando para APP")
                    setRedirectTo("APP")
                } else {
                    console.log("❌ Usuário não autenticado, redirecionando para AUTH")
                    setRedirectTo("AUTH")
                }
            } catch (error) {
                console.error("❌ Erro ao verificar autenticação:", error)
                // Em caso de erro, redirecionar para auth
                setRedirectTo("AUTH")
            } finally {
                setIsInitializing(false)
            }
        }

        checkAuthentication()
    }, [checkIsSigned, setRedirectTo, sessionData])

    // Mostrar loading enquanto inicializa
    if (isInitializing || !redirectTo) {
        return <LoadingScreen />
    }

    // Renderizar rota baseada no estado de autenticação
    if (redirectTo === "APP" && isAuthenticated) {
        return <AppRoute />
    } else {
        return <AuthRoute />
    }
}
