import React, { createContext, useContext } from "react"
import AuthContext from "../../contexts/auth"
import api from "../../services/api"
import NetInfo from '@react-native-community/netinfo'

interface FamousUsersContextProps {
    isConnected: boolean | null
    fetchData: () => Promise<any[]> // Adicionando a assinatura da função
}
interface FamousUsersContextProvider { children: React.ReactNode }
  
const FamousUsersContext = createContext<FamousUsersContextProps | undefined>(undefined)

export function FamousUsersContextProvider({children}: FamousUsersContextProvider) {
    const [isConnected, setIsConnected] = React.useState<boolean | null>(true)

    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
          setIsConnected(state.isConnected)
        })
        return () => unsubscribe()
      }, [])

    const fetchData = async () => {
        try{
            const response = api.get('/user/most-famous?page=1&pageSize=4')
            .then(function (response) { console.log(response.data);return response.data })
            .catch(function (error) { console.log(error)})

            return await response          
        } catch(err) {
            console.error('Erro ao buscar dados da API:', err)
        }            
    }
  
    const contextValue: FamousUsersContextProps = {
        isConnected,
        fetchData: fetchData,
    };
  
    return (
        <FamousUsersContext.Provider value={contextValue}>
            {children}
        </FamousUsersContext.Provider>
    );
}

export function useFamousUsersContext() {
    const context = useContext(FamousUsersContext)
    if(!context) {
        throw new Error("FamousUsers.* component must be rendered as child of FamousUsers component")
    }
    return context
}

export default FamousUsersContext