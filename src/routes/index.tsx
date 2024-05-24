import React from "react"
import AppRoute from "./app.routes"
import AuthRoute from "./auth.routes"
import AuthContext from "../contexts/auth"
import LoadingScreen from "../pages/auth/Loading"

export default function Routes() {
    const {signed, checkAuthenticated } = React.useContext(AuthContext);
    const [redirectTo, setRedirectTo] = React.useState<string | null>(null);
  
    React.useEffect(() => {
      const checkAuth = async () => {
        const isAuthenticated = await checkAuthenticated()
        if (isAuthenticated) setRedirectTo('App')
        else setRedirectTo('Auth')
      }; checkAuth()
    }, [checkAuthenticated])


    if (!signed || !redirectTo) return <LoadingScreen/>
    return redirectTo === 'App' ? <AppRoute /> : <AuthRoute />
  }