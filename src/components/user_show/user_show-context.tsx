import { createContext, useContext } from "react"
import { userReciveDataProps } from "./user_show-types"

type contextValue = {
    user: userReciveDataProps
    executeBeforeClick: () => void
    follow: () => void
    unfollow: () => void
    view_profile: () => void
}
const UserShowContext = createContext<contextValue | null>(null)

export function useUserShowContext() {
    const context = useContext(UserShowContext)
    if (!context) {
        throw new Error("UserShow.* component must be rendered as child of UserShow component")
    }
    return context
}

export default UserShowContext
