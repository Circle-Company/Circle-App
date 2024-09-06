import React from "react"
import { useKeyboard } from "../../lib/hooks/useKeyboard"
import PersistedContext from "../Persisted"
import { useFeed } from "./functions/useFeed"
import { FeedProviderProps } from "./types"

const FeedContext = React.createContext(
    {} as ReturnType<typeof useFeed> & ReturnType<typeof useKeyboard>
)

export function Provider({ children }: FeedProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const feed = useFeed(session.user.id)
    const keyboard = useKeyboard()

    return <FeedContext.Provider value={{ ...feed, ...keyboard }}>{children}</FeedContext.Provider>
}

export default FeedContext
