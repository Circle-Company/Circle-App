import React from "react"
import { useKeyboard } from "@/lib/hooks/useKeyboard"
import { useFeed } from "@/contexts/Feed/useFeed"
import { FeedProviderProps } from "@/contexts/Feed/types"

const FeedContext = React.createContext(
    {} as ReturnType<typeof useFeed> & ReturnType<typeof useKeyboard>,
)

export function Provider({ children }: FeedProviderProps) {
    const feed = useFeed()
    const keyboard = useKeyboard()

    return <FeedContext.Provider value={{ ...feed, ...keyboard }}>{children}</FeedContext.Provider>
}

export default FeedContext
