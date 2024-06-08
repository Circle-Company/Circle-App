import React from "react"
import AppRoute from "./app.routes"
import AuthRoute from "./auth.routes"
import AuthContext from "../contexts/auth"
import LoadingScreen from "../pages/auth/Loading"

export default function Routes() {
    const {checkIsSigned, sessionData} = React.useContext(AuthContext);
    const [redirectTo, setRedirectTo] = React.useState<string | null>(null);

    React.useEffect(() => {
      const checkAuth = async () => {
        const isAuthenticated = checkIsSigned()
        if (isAuthenticated) setRedirectTo('App')
        else setRedirectTo('Auth')
      }; checkAuth()
    }, [checkIsSigned, sessionData])

    React.useEffect(() => {
      const checkAuth = async () => {
        const isAuthenticated = checkIsSigned()
        if (isAuthenticated) setRedirectTo('App')
        else setRedirectTo('Auth')
      }; checkAuth()
    }, [])


    if (!sessionData || !redirectTo) return <LoadingScreen/>
    return redirectTo === 'App' ? <AppRoute /> : <AuthRoute />
  }