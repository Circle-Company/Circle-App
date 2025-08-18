import React, { useCallback, useState } from "react"
import { InteractionProps, MomentProps } from "../types"

import { MomentDataProps } from "../../../components/moment/context/types"
import { useTimer } from "../../../lib/hooks/useTimer"
import { feedMock } from "../../../mocks/feedMock"
import api from "../../../services/Api"
import PersistedContext from "../../Persisted"
import { ChunksManager } from "./chunks-mananger"
import { videoCacher } from "./video-cacher"

// Debounce de tempo em ms para evitar requisições excessivas
const DEBOUNCE_TIME = 5000 // 5 segundos

export const useFeed = () => {
    const { session } = React.useContext(PersistedContext)
    const [feedData, setFeedData] = useState<MomentProps[]>(feedMock)
    const [loading, setLoading] = useState(false)
    const [scrollEnabled, setScrollEnabled] = useState(true)
    const [focusedChunkItem, setFocusedChunkItem] = useState<{ id: number; index: number } | null>(
        null,
    )
    const [commentEnabled, setCommentEnabled] = useState<boolean>(false)
    const [focusedMoment, setFocusedMoment] = useState<MomentDataProps>({} as MomentDataProps)
    const [currentChunkIds, setCurrentChunkIds] = useState<number[]>([])
    const [interactions, setInteractions] = useState<InteractionProps[]>([])
    const [period, setPeriod] = useState(0)

    const [lastRequestTime, setLastRequestTime] = useState<number>(0) // Timestamp da última requisição

    function setFocusedChunkItemFunc({ id }: { id: number }) {
        currentChunkIds.map((item, index) => {
            if (item === id) setFocusedChunkItem({ id, index })
        })
    }

    const [resetTimer] = useTimer(1000, () => setPeriod((prev) => prev + 1))

    const fetchFeed = useCallback(
        async (isReloading = false) => {
            if (!session.user) throw new Error("User not found")
            const currentTime = Date.now()

            // Verifica se já passou tempo suficiente (debounce) para evitar requisições seguidas
            if (currentTime - lastRequestTime < DEBOUNCE_TIME) {
                console.log("Debounce ativo, evitando nova requisição")
                return
            }

            setScrollEnabled(false)
            setLoading(true)
            resetTimer()

            try {
                const response = await api.post(
                    "/moments/feed",
                    {
                        period,
                        length: interactions.length,
                        data: interactions,
                    },
                    { headers: { Authorization: session.account.jwtToken } },
                )
                // setFeedData(response.data)

                const moments: MomentProps[] = response.data || []
                const newChunkIds = moments.map((moment) => moment.id)
                const currentPostIds = feedData.map((item) => item.id)

                const { addChunkOnList, resetFeedList, updatedList } = ChunksManager({
                    reloading: isReloading,
                    period,
                    previousList: currentPostIds,
                    newList: newChunkIds,
                    maxItems: 100, // Define o máximo de itens na lista
                })

                if (resetFeedList) {
                    // setFeedData(moments) // Substitui completamente o feed
                    setCurrentChunkIds(newChunkIds)
                    videoCacher.clear()
                } else if (addChunkOnList) {
                    const uniqueNewChunks = moments.filter(
                        (moment) => !currentPostIds.includes(moment.id),
                    )

                    setFeedData(updatedList.map((id) => moments.find((m) => m.id === id)!)) // Atualiza mantendo a ordem dos IDs
                    setCurrentChunkIds((prevChunkIds) => [
                        ...prevChunkIds,
                        ...uniqueNewChunks.map((m) => m.id),
                    ])
                }

                setLastRequestTime(currentTime) // Atualiza o timestamp da última requisição
            } catch (error) {
                console.error("Erro ao buscar feed:", error)
            } finally {
                setScrollEnabled(true)
                setLoading(false)
                setInteractions([]) // Limpa interações após a resposta
            }
        },
        [feedData, interactions, session, lastRequestTime, period, resetTimer],
    )

    function next() {
        if (
            Number(focusedChunkItem?.index ?? +1) < feedData.length &&
            commentEnabled == false &&
            loading == false &&
            scrollEnabled
        )
            return true
        else return false
    }

    function previous() {
        if (
            Number(focusedChunkItem?.index) > 0 &&
            commentEnabled == false &&
            loading == false &&
            scrollEnabled
        )
            return true
        else return false
    }

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
        setScrollEnabled,
        next,
        previous,
        reloadFeed: () => fetchFeed(true),
    }
}
