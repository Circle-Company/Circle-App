import { UseQueryResult, useQuery } from "@tanstack/react-query"
import React from "react"
import api from "../services/Api"
import PersistedContext from "./Persisted"

type ViewProfileProviderProps = {
    children: React.ReactNode
}
export type ProfileDataProps = {
    id: string
    username: string
    access_level: number
    verifyed: boolean
    deleted: boolean
    blocked: boolean
    muted: boolean
    send_notification_emails: boolean
    name: string | null
    description: string | null
    last_active_at: string
    profile_picture: {
        fullhd_resolution: string
        tiny_resolution: string
    }
    statistics: {
        total_followers_num: number
        total_likes_num: number
        total_views_num: number
    }
    you_follow: boolean
}
export type ViewProfileContextsData = {
    userProfile: ProfileDataProps
    useUserProfile: (findedUserPk: string) => UseQueryResult<ProfileDataProps, Error>
}

const ViewProfileContext = React.createContext<ViewProfileContextsData>(
    {} as ViewProfileContextsData
)

export function Provider({ children }: ViewProfileProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [userProfile, setUserProfile] = React.useState({} as ProfileDataProps)

    const useUserProfile = (findedUserPk: string) => {
        return useQuery<ProfileDataProps, Error>({
            queryKey: ["view-profile", findedUserPk],
            queryFn: async () => {
                const response = await api.post(
                    `/user/profile/data/pk/${findedUserPk}`,
                    {
                        user_id: session.user.id,
                    },
                    {
                        headers: {
                            Authorization: session.account.jwtToken,
                        },
                    }
                )
                setUserProfile(response.data)
                return response.data
            },
            enabled: !!session?.user?.id && !!findedUserPk, // Executa a query somente se os dados necessários estiverem disponíveis
        })
    }

    const contextValue: any = {
        userProfile,
        useUserProfile,
    }
    return (
        <ViewProfileContext.Provider value={contextValue}>{children}</ViewProfileContext.Provider>
    )
}
export default ViewProfileContext
