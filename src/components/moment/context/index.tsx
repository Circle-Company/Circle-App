import React, { useEffect, useMemo } from "react"
import FeedContext from "../../../contexts/Feed"
import PersistedContext from "../../../contexts/Persisted"
import sizes from "../../../layout/constants/sizes"
import { useMomentData } from "./momentData"
import { useMomentOptions } from "./momentOptions"
import { useMomentUserActions } from "./momentUserActions"
import { MomentContextsData, MomentProviderProps } from "./types"

const MomentContext = React.createContext<MomentContextsData>({} as MomentContextsData)

export function MomentProvider({
    children,
    isFeed,
    isFocused,
    momentData,
    momentSize = sizes.moment.standart,
}: MomentProviderProps) {
    const { feedData, setFocusedChunkItemFunc, currentChunkIds } = React.useContext(FeedContext)
    const { session } = React.useContext(PersistedContext)
    const momentDataStore = useMomentData()
    const momentUserActionsStore = useMomentUserActions()
    const momentOptionsStore = useMomentOptions()
    const isMe = momentData.user?.id ? session.user.id === momentData.user.id : true

    useEffect(() => {
        momentDataStore.setMomentData(momentData)
    }, [momentData])

    useEffect(() => {
        momentUserActionsStore.setMomentUserActions({
            liked: momentData.is_liked,
            initialLikedState: momentData.is_liked,
            shared: false,
            viewed: false,
            clickIntoMoment: false,
            watchTime: 0,
            clickProfile: false,
            commented: false,
            likeComment: false,
            skipped: false,
            showLessOften: false,
            reported: false,
        })
        momentOptionsStore.setMomentOptions({
            isFeed: isFeed,
            isFocused: isFocused,
            enableLikeButton: !isMe,
            enableAnalyticsView: isMe,
            enableModeration: !isMe,
            enableStoreActions: isMe,
            enableTranslation: true,
        })
    }, [isFeed, isFocused, isMe])

    useEffect(() => {
        async function fetch() {
            if (currentChunkIds.includes(Number(momentDataStore.id)) && feedData) {
                const getChunkInteractions = async () => {
                    const momentData = await momentDataStore.exportMomentData()
                    const interaction = momentUserActionsStore.exportMomentUserActions()
                    const chunkData = {
                        id: momentData.id,
                        userId: momentData.userId,
                        tags: momentData.tags,
                        duration: momentData.duration,
                        type: momentData.type,
                        language: momentData.language,
                        interaction,
                    }
                    setFocusedChunkItemFunc(chunkData)
                }
                await getChunkInteractions()
            }
        }
        fetch()
    }, [currentChunkIds])

    const contextValue: any = useMemo(
        () => ({
            momentOptions: momentOptionsStore,
            momentSize: momentSize,
            momentData: momentDataStore,
            momentUserActions: momentUserActionsStore,
        }),
        [momentOptionsStore, momentSize, momentDataStore, momentUserActionsStore]
    )

    return <MomentContext.Provider value={contextValue}>{children}</MomentContext.Provider>
}

export default MomentContext
