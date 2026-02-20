import { MomentContextsData, MomentProviderProps } from "./types"
import React, { useEffect, useMemo } from "react"

import FeedContext from "../../../contexts/Feed"
import PersistedContext from "../../../contexts/Persisted"
import sizes from "../../../constants/sizes"
import { useData } from "./moment.data"
import { useOptions } from "./moment.options"
import { useActions } from "./moment.actions"
import { useVideo } from "./moment.video"

const MomentContext = React.createContext<MomentContextsData>({} as MomentContextsData)

export function MomentProvider({
    children,
    isFeed,
    isFocused,
    data,
    size = sizes.moment.standart,
    shadow,
}: MomentProviderProps) {
    const { feedData, setFocusedChunkItemFunc, currentChunk } = React.useContext(FeedContext)
    const { session } = React.useContext(PersistedContext)

    const DataStore = useData()
    const ActionsStore = useActions(data.id)
    const OptionsStore = useOptions()
    const VideoStore = useVideo()

    const isMe = data.user?.id ? session.user.id === data.user.id : true

    useEffect(() => {
        DataStore.set(data)
    }, [data])

    useEffect(() => {
        const isHidden = session.account.hiddenMoments.includes(data.id)
        ActionsStore.set({
            like: data.isLiked!,
            comment: false,
            watch: 0,
            initialLikedState: isFeed ? false : data.isLiked!,
        })
        OptionsStore.set({
            isFeed: isFeed,
            isFocused: isFocused,
            enableLike: !isMe,
            enableComment: !isMe,
            enableWatch: !isMe,
            enableReport: !isMe,
            enableContentWarning: data.contentWarning,
            isHidden: isHidden,
            showReportModal: !isMe,
        })
    }, [isFeed, isFocused, isMe])

    // Inicializar o vídeo apenas uma vez
    useEffect(() => {
        const globalMuteAudio = session?.preferences?.content?.muteAudio || false
        VideoStore.set({
            currentTime: 0,
            duration: 0,
            isPaused: !isFocused,
            isMuted: globalMuteAudio,
            shadow,
        })
    }, [isFocused])

    useEffect(() => {
        const globalMuteAudio = session?.preferences?.content?.muteAudio || false
        if (VideoStore?.setIsMuted) {
            VideoStore.setIsMuted(globalMuteAudio)
        }
    }, [session?.preferences?.content?.muteAudio])

    useEffect(() => {
        async function fetch() {
            if (data.id && currentChunk.includes(data.id) && feedData) {
                const getChunkInteractions = async () => {
                    const chunkData = {
                        id: String(data.id),
                        userId: data.user.id,
                        duration: data.duration,
                    }
                    setFocusedChunkItemFunc(chunkData)
                }
                await getChunkInteractions()
            }
        }
        fetch()
    }, [currentChunk])

    const contextValue: any = useMemo(
        () => ({
            size,
            data: DataStore,
            actions: ActionsStore,
            options: OptionsStore,
            video: VideoStore,
        }),
        // Recompute when options hidden state toggles to force re-render
        [size, DataStore, ActionsStore, OptionsStore, OptionsStore?.isHidden, , VideoStore],
    )

    return <MomentContext.Provider value={contextValue}>{children}</MomentContext.Provider>
}

export default MomentContext
