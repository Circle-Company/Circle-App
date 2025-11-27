import { SessionDataType, UserDataType } from "../../contexts/Persisted/types"

import PersistedContext from "../../contexts/Persisted"
import React from "react"

type SignInResponseProps = {
    accessToken: string
    user: UserDataType
}

export const createSignInResponse = (session: SessionDataType): SignInResponseProps => ({
    accessToken: session.account.jwtToken,
    user: session.user,
})

export function useSignInResponse(): SignInResponseProps {
    const { session } = React.useContext(PersistedContext)
    return React.useMemo(() => createSignInResponse(session), [session])
}
