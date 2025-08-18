import React from "react"
import api from "../services/Api"
import PersistedContext from "./Persisted"
import { StatisticsDataType, UserDataType } from "./Persisted/types"
import BottomTabsContext from "./bottomTabs"

export interface ProfileData extends UserDataType {
    you_follow?: boolean
    statistics: StatisticsDataType
}
type ProfileProviderProps = { children: React.ReactNode }
export type ProfileContextsData = {
    showAnalytics: boolean
    showStatistics: boolean
    showEditTabs: boolean
    refreshing: boolean
    loading: boolean
    currentUser: ProfileData
    getCurrentUser: ({ user_id }: { user_id: number }) => Promise<void>
    setCurrentUser: React.Dispatch<React.SetStateAction<ProfileData>>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setRefreshing: React.Dispatch<React.SetStateAction<boolean>>
}

const ProfileContext = React.createContext<ProfileContextsData>({} as ProfileContextsData)

export function Provider({ children }: ProfileProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const { currentTab } = React.useContext(BottomTabsContext)
    const [loading, setLoading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [currentUser, setCurrentUser] = React.useState({} as ProfileData)

    const isMe: boolean = currentTab == "Account"
    const showAnalytics: boolean = isMe
    const showStatistics: boolean = isMe
    const showEditTabs: boolean = isMe

    async function getCurrentUser({ user_id }: { user_id: number }) {
        if (!isMe) {
            try {
                await api
                    .post(
                        `/user/profile/data/pk/${user_id}`,
                        { user_id },
                        { headers: { Authorization: session.account.jwtToken } },
                    )
                    .then(function (response) {
                        setCurrentUser(response.data)
                        setLoading(false)
                        console.log(currentUser)
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            } catch (err: any) {
                console.error(err)
            }
        } else {
            const user: ProfileData = {
                ...session.user,
                ...session.statistics,
            }
            setCurrentUser(user)
        }
    }

    const contextValue: ProfileContextsData = {
        showAnalytics,
        showStatistics,
        showEditTabs,
        refreshing,
        loading,
        currentUser,
        getCurrentUser,
        setLoading,
        setRefreshing,
    }

    return <ProfileContext.Provider value={contextValue}>{children}</ProfileContext.Provider>
}
export default ProfileContext
