import React from "react"
import { ProfileMainRootProps } from "../../profile-types"
import ProfileContext from "../../profile-context"

export default function main_root({ children, data }: ProfileMainRootProps) {
    return <ProfileContext.Provider value={{ user: data }}>{children}</ProfileContext.Provider>
}
