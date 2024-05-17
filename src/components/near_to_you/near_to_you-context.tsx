import React, { createContext, useContext } from "react"
import AuthContext from "../../contexts/auth"
import api from "../../services/api"
import NetInfo from '@react-native-community/netinfo'

interface NearToYouContextProps {
    isConnected: boolean | null
    fetchData: () => Promise<any[]> // Adicionando a assinatura da função
}
interface NearToYouContextProvider { children: React.ReactNode }
  
const NearToYouContext = createContext<NearToYouContextProps | undefined>(undefined)

export function NearToYouContextProvider({children}: NearToYouContextProvider) {
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
  
    const contextValue: NearToYouContextProps = {
        isConnected,
        fetchData: fetchData,
    };
  
    return (
        <NearToYouContext.Provider value={contextValue}>
            {children}
        </NearToYouContext.Provider>
    );
}

export function useNearToYouContext() {
    const context = useContext(NearToYouContext)
    if(!context) {
        throw new Error("NearToYou.* component must be rendered as child of NearToYou component")
    }
    return context
}

export default NearToYouContext