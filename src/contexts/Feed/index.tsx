import React from "react"

import moments from '../../data/moment.json'
import {FeedProviderProps, MomentProps } from './types'
import { Animated } from "react-native"
import MomentContext from "../../components/moment/context"
import { MomentDataProps } from "../../components/moment/context/types"
import api from "../../services/api"
import PersistedContext from "../Persisted"
import { CommentObject } from "../../components/comment/comments-types"

type FeedContextsData = {
    feedData: MomentProps[]
    loadingFeed: boolean
    focusedItemIndex: number
    focusedItemId: number
    focusedMoment: MomentDataProps
    commentEnabled: boolean
    allCommentsEnabled: boolean
    enableScrollFeed: boolean
    scrollOffset: Animated.Value
    showKeyboard: boolean
    getFeed: () => Promise<void>
    setShowKeyboard: React.Dispatch<React.SetStateAction<boolean>>
    setAllCommentsEnabled: React.Dispatch<React.SetStateAction<boolean>>
    setFocusedItemIndex: React.Dispatch<React.SetStateAction<number>>
    setFocusedItemId: React.Dispatch<React.SetStateAction<number>>
    setFocusedMoment: React.Dispatch<React.SetStateAction<MomentDataProps>>
    setCommentEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

const FeedContext = React.createContext<FeedContextsData>({} as FeedContextsData)

export function FeedProvider({children}: FeedProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [ loadingFeed, setLoadingFeed ] = React.useState(false)
    const [ focusedItemIndex, setFocusedItemIndex] = React.useState<null | number>(null)
    const [ focusedItemId, setFocusedItemId] = React.useState<null | number>(null)
    const [ feedData, setFeedData ] = React.useState<MomentProps[]>([])
    const [ commentEnabled, setCommentEnabled ] = React.useState(false)
    const [ enableScrollFeed, setEnableScrollFeed ] = React.useState(true)
    const [ allCommentsEnabled, setAllCommentsEnabled ] = React.useState(false)
    const [ scrollOffset ] = React.useState(new Animated.Value(0))
    const [ showKeyboard, setShowKeyboard ] = React.useState(false)
    const [ focusedMoment, setFocusedMoment ] = React.useState<MomentDataProps>()
    const [ sendedComments, setSendedComments ] = React.useState<any>()

    async function getFeed() {
        await api.post(`/moment/get-feed`, { 
            user_id: session.user.id
        })
        .then(function (response) { setFeedData(response.data) })
        .catch(function (error) { console.log(error)})  
    }

    React.useEffect(() => {
        setLoadingFeed(true)
        getFeed()
        .finally(() => {
            setLoadingFeed(false)
        })
        
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
        focusedItemId,
        loadingFeed,
        focusedItemIndex,
        commentEnabled,
        enableScrollFeed,
        allCommentsEnabled,
        scrollOffset,
        showKeyboard,
        focusedMoment,
        sendedComments,
        setFocusedItemIndex,
        setFocusedItemId,
        setCommentEnabled,
        setAllCommentsEnabled,
        setFocusedMoment,
        setShowKeyboard,
        getFeed
    }

    return <FeedContext.Provider value={feedContextValue}>{children}</FeedContext.Provider>
}
export default FeedContext