import React from "react"
import AppRoute from "./app.routes"
import AuthRoute from "./auth.routes"
import AuthContext from "../contexts/auth"
import LoadingScreen from "../pages/auth/Loading";

export default function Routes() {
    const { signed, checkAuthenticated } = React.useContext(AuthContext);
    const [authChecked, setAuthChecked] = React.useState(false);
    const [redirectTo, setRedirectTo] = React.useState<string | null>(null);
  
    React.useEffect(() => {
      const checkAuth = async () => {
        const isAuthenticated = await checkAuthenticated();
        setAuthChecked(true);
  
        if (isAuthenticated) {
          setRedirectTo('AppRoute');
        } else {
          setRedirectTo('AuthRoute');
        }
      };
  
      checkAuth();
    }, [checkAuthenticated]);
  
    if (!authChecked || !redirectTo) return <LoadingScreen/>
    return redirectTo === 'AppRoute' ? <AppRoute /> : <AuthRoute />;
  }