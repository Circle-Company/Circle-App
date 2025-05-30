import { MomentContextsData, MomentProviderProps } from "./types"
import React, { useEffect, useMemo } from "react"

import FeedContext from "../../../contexts/Feed"
import PersistedContext from "../../../contexts/Persisted"
import sizes from "../../../layout/constants/sizes"
import { useMomentData } from "./momentData"
import { useMomentOptions } from "./momentOptions"
import { useMomentUserActions } from "./momentUserActions"
import { useMomentVideo } from "./momentVideo"

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
    const momentVideoStore = useMomentVideo()
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
            enableReport: true,
            enableLikeButton: !isMe,
            enableAnalyticsView: isMe,
            enableModeration: !isMe,
            enableStoreActions: isMe,
            enableTranslation: true,
        })
    }, [isFeed, isFocused, isMe])

    // Inicializar o vídeo apenas uma vez
    useEffect(() => {
        const globalMuteAudio = session?.preferences?.content?.muteAudio || false
        momentVideoStore.setMomentVideo({
            currentTime: 0,
            duration: 0,
            isPaused: !isFocused,
            isMuted: globalMuteAudio
        })
    }, [isFocused]) // Removido session?.preferences?.content?.muteAudio

    // Sincronizar mudanças na preferência global com o estado do vídeo
    useEffect(() => {
        const globalMuteAudio = session?.preferences?.content?.muteAudio || false
        if (momentVideoStore?.setIsMuted) {
            momentVideoStore.setIsMuted(globalMuteAudio)
        }
    }, [session?.preferences?.content?.muteAudio])

    useEffect(() => {
        async function fetch() {
            if (currentChunkIds.includes(Number(momentDataStore.id)) && feedData) {
                const getChunkInteractions = async () => {
                    const momentData = await momentDataStore.exportMomentData()
                    const interaction = momentUserActionsStore.exportMomentUserActions()
                    const chunkData = {
                        id: Number(momentData.id),
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
            momentVideo: momentVideoStore,
        }),
        [momentOptionsStore, momentSize, momentDataStore, momentUserActionsStore, momentVideoStore]
    )

    return <MomentContext.Provider value={contextValue}>{children}</MomentContext.Provider>
}

export default MomentContext
