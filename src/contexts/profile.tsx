import { UserDataType } from "@/contexts/Persisted/types"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import api from "@/api"

export interface ProfileData extends UserDataType {
    interactions: {
        isFollowing: boolean
        isFolllowedBy: boolean
        isBlockedBy: boolean
        isBlocking: boolean
    }
    status: {
        verified: boolean
    }
    metrics: {
        totalMomentsCreated: number
        totalFollowers: number
    }
}
type ProfileProviderProps = { children: React.ReactNode }
export type ProfileContextsData = {
    refreshing: boolean
    loading: boolean
    user: ProfileData
    getUser: (id: string) => Promise<void>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setRefreshing: React.Dispatch<React.SetStateAction<boolean>>
}

const ProfileContext = React.createContext<ProfileContextsData>({} as ProfileContextsData)

export function Provider({ children }: ProfileProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [loading, setLoading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [user, setUser] = React.useState({} as ProfileData)

    async function getUser(id: string) {
        try {
            await api
                .get(`/users/${id}`, {
                    headers: { Authorization: session.account.jwtToken },
                })
                .then(function (response) {
                    setUser(response.data)
                    setLoading(false)
                })
                .catch(function (error) {
                    console.log(error)
                })
        } catch (err: any) {
            console.error(err)
        }
    }

    const contextValue: ProfileContextsData = {
        refreshing,
        loading,
        user,
        getUser,
        setLoading,
        setRefreshing,
    }

    return <ProfileContext.Provider value={contextValue}>{children}</ProfileContext.Provider>
}
export default ProfileContext
