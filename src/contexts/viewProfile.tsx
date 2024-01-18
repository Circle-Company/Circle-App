import React from "react"
import api from "../services/api"

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
type ViewProfileContextsData = {
    user: ProfileDataProps,
    setProfile: () => void,
}

const ViewProfileContext = React.createContext<ViewProfileContextsData>({} as ViewProfileContextsData)

export function ViewProfileProvider({children}: ViewProfileProviderProps) {
    const [user, setUser] = React.useState()

    async function setProfile (username: string){
            try{
                const response = api.post(`/user/profile/${username}`, {
                    user_id: 1,
                })
                .then(function (response) { setUser(response.data) })
                .catch(function (error) { console.log(error)})
    
                return await response          
            } catch(err) {
                console.error(err)
            } 
    }

    const contextValue = {
        setProfile,
        user,        
    }
    return (
        <ViewProfileContext.Provider value={contextValue}>
            {children}
        </ViewProfileContext.Provider>
    )
}
export default ViewProfileContext