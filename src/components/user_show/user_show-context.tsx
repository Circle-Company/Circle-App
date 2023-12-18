import React, { createContext, useContext } from "react"
import { userReciveDataProps } from "./user_show-types"

const UserShowContext = createContext<{ user: userReciveDataProps} | null>(null)

export function useUserShowContext() {
    const context = useContext(UserShowContext)
    if(!context) {
        throw new Error("UserShow.* component must be rendered as child of UserShow component")
    }
    return context
}

export default UserShowContext