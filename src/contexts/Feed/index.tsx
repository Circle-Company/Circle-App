import React from "react"
import { Animated } from "react-native"
import {
    MomentDataProps,
    MomentUserActionsProps,
    TagProps,
} from "../../components/moment/context/types"
import { useTimer } from "../../lib/hooks/useTimer"
import { LanguagesCodesType } from "../../locales/LanguageTypes"
import api from "../../services/Api"
import PersistedContext from "../Persisted"
import { FeedProviderProps, MomentProps } from "./types"

export type InteractionProps = {
    id: number
    tags: TagProps[]
    duration: number
    type: "IMAGE" | "VIDEO"
    language: LanguagesCodesType
    interaction: MomentUserActionsProps
}
export type ChunkInteractionsProps = {
    length: number
    period: number
    data: InteractionProps[]
}
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
    currentChunkIds: Array<number>
    chunkInteractions: InteractionProps[]
    getFeed: () => Promise<void>
    reloadFeed: () => Promise<void>
    setChunkInteractionsFunc: (value: InteractionProps) => void
    setShowKeyboard: React.Dispatch<React.SetStateAction<boolean>>
    setAllCommentsEnabled: React.Dispatch<React.SetStateAction<boolean>>
    setFocusedItemIndex: React.Dispatch<React.SetStateAction<number>>
    setFocusedItemId: React.Dispatch<React.SetStateAction<number>>
    setFocusedMoment: React.Dispatch<React.SetStateAction<MomentDataProps>>
    setCommentEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

const FeedContext = React.createContext<FeedContextsData>({} as FeedContextsData)

export function Provider({ children }: FeedProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [loadingFeed, setLoadingFeed] = React.useState(false)
    const [focusedItemIndex, setFocusedItemIndex] = React.useState<null | number>(null)
    const [focusedItemId, setFocusedItemId] = React.useState<null | number>(null)
    const [feedData, setFeedData] = React.useState<MomentProps[]>([])
    const [commentEnabled, setCommentEnabled] = React.useState(false)
    const [currentChunkIds, setCurrentChunksIds] = React.useState<Array<number>>([])
    const [enableScrollFeed, setEnableScrollFeed] = React.useState(true)
    const [allCommentsEnabled, setAllCommentsEnabled] = React.useState(false)
    const [scrollOffset] = React.useState(new Animated.Value(0))
    const [showKeyboard, setShowKeyboard] = React.useState(false)
    const [focusedMoment, setFocusedMoment] = React.useState<MomentDataProps>()
    const [sendedComments, setSendedComments] = React.useState<any>()
    const [chunkInteractions, setChunkInteractions] = React.useState<InteractionProps[]>(
        [] as InteractionProps[]
    )
    const [period, setPeriod] = React.useState(0)

    const handleTick = () => {
        setPeriod((prevCount) => prevCount + 1)
    }

    const [resetTimer] = useTimer(1000, handleTick)

    function setChunkInteractionsFunc(value: InteractionProps) {
        const valueToInsert = chunkInteractions.concat(value)
        setChunkInteractions(valueToInsert)
    }

    async function reloadFeed() {
        setEnableScrollFeed(false)
        setLoadingFeed(true)
        await api
            .post(`/moment/get-feed`, {
                user_id: session.user.id,
                period,
                length: chunkInteractions.length,
                data: chunkInteractions,
            })
            .then(function (response) {
                const postsIds = response.data.map((moment: any) => moment.id)
                setCurrentChunksIds(postsIds)
                setFeedData(response.data)
            })
            .finally(() => {
                setEnableScrollFeed(true)
                resetTimer()
                setLoadingFeed(false)
                setChunkInteractions([])
            })
    }

    async function getFeed() {
        setEnableScrollFeed(false)
        setLoadingFeed(true)
        await api
            .post(`/moment/get-feed`, {
                user_id: session.user.id,
                period,
                length: chunkInteractions.length,
                data: chunkInteractions,
            })
            .then(function (response) {
                if (feedData.length > 0) setFeedData([...feedData, ...response.data])
                else setFeedData(response.data)
                const postsIds = response.data.map((moment: any) => moment.id)
                setCurrentChunksIds(postsIds)
            })
            .finally(() => {
                resetTimer()
                setEnableScrollFeed(true)
                setLoadingFeed(false)
                setChunkInteractions([])
            })
    }

    React.useEffect(() => {
        getFeed()
    }, [])

    React.useEffect(() => {
        if (commentEnabled) {
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
        currentChunkIds,
        chunkInteractions,
        setFocusedItemIndex,
        setFocusedItemId,
        setCommentEnabled,
        setAllCommentsEnabled,
        setFocusedMoment,
        setShowKeyboard,
        getFeed,
        reloadFeed,
        setChunkInteractionsFunc,
    }

    return <FeedContext.Provider value={feedContextValue}>{children}</FeedContext.Provider>
}
export default FeedContext
