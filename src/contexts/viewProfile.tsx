import React from "react"
import api from "../services/Api"
import PersistedContext from "./Persisted"

type ViewProfileProviderProps = {
    children: React.ReactNode
}
export type ProfileDataProps = {
    id: number
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
    setProfile: (Id: number) => Promise<void>
}

const ViewProfileContext = React.createContext<ViewProfileContextsData>(
    {} as ViewProfileContextsData
)

export function Provider({ children }: ViewProfileProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [userProfile, setUserProfile] = React.useState<ProfileDataProps>({} as ProfileDataProps)

    async function setProfile(Id: number) {
        try {
            if (!Id) throw new Error("Can´t possible find user without pass Id")
            const response = api
                .post(
                    `/user/profile/data/pk/${Id}`,
                    {
                        user_id: session.user.id,
                    },
                    { headers: { authorization_token: session.account.jwtToken } }
                )
                .then(function (response) {
                    setUserProfile(response.data)
                })
                .catch(function (error) {
                    console.log(error)
                })

            console.log(response)
            return await response
        } catch (err) {
            console.error(err)
        }
    }

    React.useEffect(() => {
        setProfile(userProfile.id)
    }, [setUserProfile])

    const contextValue: any = {
        setProfile,
        userProfile: userProfile,
    }
    return (
        <ViewProfileContext.Provider value={contextValue}>{children}</ViewProfileContext.Provider>
    )
}
export default ViewProfileContext
