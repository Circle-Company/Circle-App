import { createContext, useContext } from "react"
import { ProfileReciveDataProps } from "./profile-types"

const ProfileContext = createContext<{ user: ProfileReciveDataProps } | null>(null)

export function useProfileContext() {
    const context = useContext(ProfileContext)
    if (!context) {
        throw new Error("Profile.* component must be rendered as child of Profile component")
    }
    return context
}

export default ProfileContext
