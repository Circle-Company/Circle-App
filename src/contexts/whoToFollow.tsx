import NetInfo from "@react-native-community/netinfo"
import React, { createContext } from "react"
import whotofollowdata from "../data/who_to_follow.json"
import api from "../services/Api"
import PersistedContext from "./Persisted"

interface WhoToFollowContextProps {
    isConnected: boolean | null
    usersRecommendation: Array<Object>
    fetchData: () => Promise<void>
}
interface WhoToFollowContextProvider {
    children: React.ReactNode
}

const WhoToFollowContext = createContext<WhoToFollowContextProps | undefined>(undefined)

export function WhoToFollowContextProvider({ children }: WhoToFollowContextProvider) {
    const { session } = React.useContext(PersistedContext)
    const [isConnected, setIsConnected] = React.useState<boolean | null>(true)
    const [usersRecommendation, setUsersRecommendation] = React.useState(whotofollowdata)

    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected)
        })
        return () => unsubscribe()
    }, [])

    const fetchData = async () => {
        try {
            const response = api
                .get("/user/most-famous?page=1&pageSize=4", {
                    headers: { Authorization: session.account.jwtToken },
                })
                .then(function (response) {
                    setUsersRecommendation(response.data)
                })
                .catch(function (error) {
                    console.log(error)
                })

            return await response
        } catch (err: any) {
            throw new Error(err.message)
        }
    }

    const contextValue: WhoToFollowContextProps = {
        isConnected,
        usersRecommendation,
        fetchData: fetchData,
    }

    return (
        <WhoToFollowContext.Provider value={contextValue}>{children}</WhoToFollowContext.Provider>
    )
}
export default WhoToFollowContext
