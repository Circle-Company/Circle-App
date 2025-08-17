import PersistedContext from "@/contexts/Persisted"
import { UserDataType } from "@/contexts/Persisted/types"
import React from "react"
type SignInResponseProps = {
    accessToken: string
    user: UserDataType
}
export function SignIn(): Promise<SignInResponseProps> {
    const { session } = React.useContext(PersistedContext)
    return new Promise((resolve) => {
        resolve({
            accessToken: session.account.jwtToken,
            user: session.user,
        })
    })
}
