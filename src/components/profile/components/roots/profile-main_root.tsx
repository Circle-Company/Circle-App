import React from "react"
import ProfileContext from "../../profile-context"
import { ProfileMainRootProps } from "../../profile-types"

export default function main_root({ children, data }: ProfileMainRootProps) {
    return <ProfileContext.Provider value={{ user: data }}>{children}</ProfileContext.Provider>
}
