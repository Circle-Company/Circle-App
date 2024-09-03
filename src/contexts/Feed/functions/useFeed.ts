import { MomentDataProps } from "@/components/moment/context/types"
import { useCallback, useEffect, useState } from "react"
import { useTimer } from "../../../lib/hooks/useTimer"
import api from "../../../services/Api"
import { InteractionProps, MomentProps } from "../types"
import { ChunksManager } from "./chunks-mananger"

export const useFeed = (userId: number) => {
    const [feedData, setFeedData] = useState<MomentProps[]>([])
    const [loading, setLoading] = useState(false)
    const [scrollEnabled, setScrollEnabled] = useState(true)
    const [focusedChunkItem, setFocusedChunkItem] = useState<{ id: number; index: number } | null>(
        null
    )
    const [commentEnabled, setCommentEnabled] = useState<boolean>(false)
    const [focusedMoment, setFocusedMoment] = useState<MomentDataProps>({} as MomentDataProps)
    const [currentChunkIds, setCurrentChunkIds] = useState<number[]>([])
    const [interactions, setInteractions] = useState<InteractionProps[]>([])
    const [period, setPeriod] = useState(0)

    function setFocusedChunkItemFunc({ id }: { id: number }) {
        currentChunkIds.map((item, index) => {
            if (item == id) setFocusedChunkItem({ id, index })
        })
    }

    const [resetTimer] = useTimer(1000, () => setPeriod((prev) => prev + 1))

    const fetchFeed = useCallback(
        async (isReloading = false) => {
            setScrollEnabled(false)
            setLoading(true)
            resetTimer()

            try {
                const response = await api
                    .post(`/moment/get-feed`, {
                        user_id: userId,
                        period,
                        length: interactions.length,
                        data: interactions,
                    })
                    .catch(() => {
                        setLoading(false)
                    })

                const newChunkIds = response.data.map((moment: any) => moment.id)
                const currentPostIds = feedData.map((item) => item.id)

                const { addChunkOnList } = ChunksManager({
                    reloading: isReloading,
                    period,
                    previousList: currentPostIds,
                    newList: newChunkIds,
                })

                if (addChunkOnList) {
                    setFeedData(response.data)
                    setCurrentChunkIds(newChunkIds)
                }
            } finally {
                setScrollEnabled(true)
                setLoading(false)
                setInteractions([])
            }
        },
        [userId]
    )

    useEffect(() => {
        fetchFeed()
    }, [fetchFeed])

    return {
        feedData,
        loading,
        scrollEnabled,
        focusedChunkItem,
        focusedMoment,
        currentChunkIds,
        interactions,
        commentEnabled,
        setCommentEnabled,
        setFocusedChunkItemFunc,
        setInteractions,
        setFocusedMoment,
        reloadFeed: () => fetchFeed(true),
    }
}
