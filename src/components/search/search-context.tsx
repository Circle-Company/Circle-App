import NetInfo from "@react-native-community/netinfo"
import React, { createContext, useContext } from "react"
import PersistedContext from "../../contexts/Persisted"
import api from "../../services/Api"

interface SearchContextProps {
    isConnected: boolean | null
    searchTerm: string
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>
    fetchData: (searchTerm: string) => Promise<any[]> // Adicionando a assinatura da função
}
interface SearchContextProvider {
    children: React.ReactNode
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined)

export function SearchContextProvider({ children }: SearchContextProvider) {
    const [searchTerm, setSearchTerm] = React.useState<string>("")
    const [isConnected, setIsConnected] = React.useState<boolean | null>(true)
    const { session } = React.useContext(PersistedContext)

    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected)
        })
        return () => unsubscribe()
    }, [])

    const fetchData = async (searchTerm: string) => {
        if (searchTerm == "") return []
        try {
            const response = api
                .post("/user/search", {
                    username_to_search: searchTerm,
                    user_id: session.user.id,
                })
                .then(function (response) {
                    return response.data
                })
                .catch(function (error) {
                    console.log(error)
                })
            return await response
        } catch (err) {
            console.error("Erro ao buscar dados da API:", err)
        }
    }

    const contextValue: SearchContextProps = {
        isConnected,
        searchTerm,
        setSearchTerm,
        fetchData: fetchData,
    }

    return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>
}

export function useSearchContext() {
    const context = useContext(SearchContext)
    if (!context) {
        throw new Error("Search.* component must be rendered as child of Search component")
    }
    return context
}

export default SearchContext
