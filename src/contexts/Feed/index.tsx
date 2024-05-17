import React from "react"

import moments from '../../data/moment.json'
import {FeedProviderProps, MomentProps } from './types'
import { Animated } from "react-native"
import MomentContext from "../../components/moment/context"
import { MomentDataProps } from "../../components/moment/context/types"

type FeedContextsData = {
    feedData: MomentProps[]
    loadingFeed: boolean
    focusedItemIndex: number
    commentEnabled: boolean
    allCommentsEnabled: boolean
    enableScrollFeed: boolean
    scrollOffset: Animated.Value
    showKeyboard: boolean
    setShowKeyboard: React.Dispatch<React.SetStateAction<boolean>>
    setAllCommentsEnabled: React.Dispatch<React.SetStateAction<boolean>>
    setFocusedItemIndex: React.Dispatch<React.SetStateAction<number>>
    setFocusedItemId: React.Dispatch<React.SetStateAction<number>>
    setCommentEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

const FeedContext = React.createContext<FeedContextsData>({} as FeedContextsData)

export function FeedProvider({children}: FeedProviderProps) {
    const [ loadingFeed, setLoadingFeed ] = React.useState(false)
    const [ focusedItemIndex, setFocusedItemIndex] = React.useState<null | number>(null)
    const [ feedData, setFeedData ] = React.useState<MomentProps[]>([])
    const [ commentEnabled, setCommentEnabled ] = React.useState(false)
    const [ enableScrollFeed, setEnableScrollFeed ] = React.useState(true)
    const [ allCommentsEnabled, setAllCommentsEnabled ] = React.useState(false)
    const [ scrollOffset ] = React.useState(new Animated.Value(0))
    const [ showKeyboard, setShowKeyboard ] = React.useState(false)
    const [ focusedMoment, setFocusedMoment ] = React.useState<MomentDataProps>()

    React.useEffect(() => {
        setLoadingFeed(true)
        setFeedData(moments)
        setLoadingFeed(false)
    }, [])

    React.useEffect(() => {
        if(commentEnabled){
            setEnableScrollFeed(false)
            setAllCommentsEnabled(true)
        } else {
            setEnableScrollFeed(true)
            setAllCommentsEnabled(false)
        }
    }, [commentEnabled, allCommentsEnabled])

    const feedContextValue: any = {
        feedData,
        loadingFeed,
        focusedItemIndex,
        commentEnabled,
        enableScrollFeed,
        allCommentsEnabled,
        scrollOffset,
        showKeyboard,
        setFocusedItemIndex,
        setCommentEnabled,
        setAllCommentsEnabled,
        setShowKeyboard
    }

    return (
    <FeedContext.Provider value={feedContextValue}>
            {children}
    </FeedContext.Provider>
    )
}
export default FeedContext