import { FeedProviderProps } from "./types"
import React from "react"
import { useFeed } from "./functions/useFeed"
import { useKeyboard } from "../../lib/hooks/useKeyboard"

const FeedContext = React.createContext(
    {} as ReturnType<typeof useFeed> & ReturnType<typeof useKeyboard>
)

export function Provider({ children }: FeedProviderProps) {
    const feed = useFeed()
    const keyboard = useKeyboard()

    return <FeedContext.Provider value={{ ...feed, ...keyboard }}>{children}</FeedContext.Provider>
}

export default FeedContext
