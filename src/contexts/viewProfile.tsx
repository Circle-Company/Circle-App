import React from "react"
import api from "../services/api"
import AuthContext from "./auth"

type ViewProfileProviderProps = {
    children: React.ReactNode
}
export type ProfileDataProps = {
	id: number,
	username: string,
	access_level: number,
	verifyed: boolean,
	deleted: boolean,
	blocked: boolean,
	muted: boolean,
	send_notification_emails: boolean,
	name: string | null,
	description: string | null,
	last_active_at: string,
	profile_picture: {
		fullhd_resolution: string,
		tiny_resolution: string
	},
	statistics: {
		total_followers_num: number,
		total_likes_num: number,
		total_views_num: number
	},
    you_follow: boolean
}
export type ViewProfileContextsData = {
    userProfile: ProfileDataProps,
    setProfile: () => Promise<void>,
}

const ViewProfileContext = React.createContext<ViewProfileContextsData>({} as ViewProfileContextsData)

export function ViewProfileProvider({children}: ViewProfileProviderProps) {
    const {user} = React.useContext(AuthContext)
    const [userProfile, setUserProfile] = React.useState()

    async function setProfile (Id: number){
        try{
            const response = api.post(`/user/profile/data/pk/${Id}`, {
                user_id: user.id,
            })
            .then(function (response) { setUserProfile(response.data) })
            .catch(function (error) { console.log(error)})

            console.log(response)
            return await response          
        } catch(err) {
            console.error(err)
        } 
    }

    const contextValue: any = {
        setProfile,
        userProfile: userProfile,        
    }
    return (
        <ViewProfileContext.Provider value={contextValue}>
            {children}
        </ViewProfileContext.Provider>
    )
}
export default ViewProfileContext