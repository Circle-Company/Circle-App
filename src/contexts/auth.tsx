import React from "react"
import {SignIn} from '../services/Auth'
import AsyncStorage from "@react-native-async-storage/async-storage"

type AuthProviderProps = {
    children: React.ReactNode
}
type AuthContextsData = {
    signed: boolean,
    accessToken?: string
    user: Object | null,
    useSignIn(): Promise<void>,
    useSignOut(): void
}

const AuthContext = React.createContext<AuthContextsData>({} as AuthContextsData)

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = React.useState<Object | null>(null)

    React.useEffect(() => {
        async function loadStorageData() {
           const storagedUser = await AsyncStorage.getItem('@CircleAuth:user')
           const storagedAccessToken = await AsyncStorage.getItem('@CircleAuth:accessToken')
           if(storagedUser && storagedAccessToken) {
            setUser(JSON.parse(storagedUser))
            }
        }
        loadStorageData()
    }, [])

    async function useSignIn() {
        const response  = await SignIn()
        setUser(response.user)

        await  AsyncStorage.setItem('@CircleAuth:user', JSON.stringify(response.user))
        await AsyncStorage.setItem('@CircleAuth:accessToken', response.accessToken)
    }

    function useSignOut() {
        setUser(null)
        AsyncStorage.removeItem('@CircleAuth:user')
        AsyncStorage.removeItem('@CircleAuth:accessToken')
    }
    return (
        <AuthContext.Provider value={{
            signed: Boolean(user),
            user,
            useSignIn,
            useSignOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext