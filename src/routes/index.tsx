import React, { useContext } from "react"
import AppRoute from "./app.routes"
import AuthRoute from "./auth.routes"
import AuthContext from "../contexts/auth"

/**
 *  { isAuth && <ScreensNavigator/>}
    { !isAuth && didTryAutoLogin && <AuthNavigator/>}
    { !isAuth && !didTryAutoLogin && <StartScreen/>}
 */

export default function Routes() {
    const {signed} = useContext(AuthContext)

    return signed? <AppRoute/> : <AuthRoute/>
}