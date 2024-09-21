import { MomentDataProps } from "@/components/moment/context/types"
import PersistedContext from "@/contexts/Persisted"
import React, { useCallback, useEffect, useState } from "react"
import { useTimer } from "../../../lib/hooks/useTimer"
import api from "../../../services/Api"
import { InteractionProps, MomentProps } from "../types"
import { ChunksManager } from "./chunks-mananger"

// Debounce de tempo em ms para evitar requisições excessivas
const DEBOUNCE_TIME = 5000 // 5 segundos

export const useFeed = (userId: number) => {
    const { session } = React.useContext(PersistedContext)
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

    const [lastRequestTime, setLastRequestTime] = useState<number>(0) // Timestamp da última requisição

    function setFocusedChunkItemFunc({ id }: { id: number }) {
        currentChunkIds.map((item, index) => {
            if (item === id) setFocusedChunkItem({ id, index })
        })
    }

    const [resetTimer] = useTimer(1000, () => setPeriod((prev) => prev + 1))

    const fetchFeed = useCallback(
        async (isReloading = false) => {
            if (!session.user) throw new Error("has not user")
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
                await api
                    .post(
                        `/moments/feed`,
                        {
                            period,
                            length: interactions.length,
                            data: interactions,
                        },
                        { headers: { authorization_token: session.account.jwtToken } }
                    )
                    .then((response) => {
                        if (response.data.length >= 1) {
                            const newChunkIds = response.data?.map((moment: any) => moment.id)
                            const currentPostIds = feedData.map((item) => item.id)

                            // Remove itens que já estão em currentChunkIds
                            const filteredNewChunks = response.data?.filter(
                                (moment: any) => !currentChunkIds.includes(moment.id)
                            )

                            const { addChunkOnList } = ChunksManager({
                                reloading: isReloading,
                                period,
                                previousList: currentPostIds,
                                newList: newChunkIds,
                            })

                            if (addChunkOnList) {
                                // Adiciona apenas os novos chunks que não estão em currentChunkIds
                                setFeedData((prevFeedData) => [
                                    ...prevFeedData,
                                    ...filteredNewChunks,
                                ])
                                setCurrentChunkIds((prevChunkIds) => [
                                    ...prevChunkIds,
                                    ...filteredNewChunks.map((chunk: any) => chunk.id),
                                ])
                            }

                            // Atualiza o timestamp da última requisição
                            setLastRequestTime(currentTime)
                        }
                    })
                    .catch(() => {
                        setLoading(false)
                    })
            } finally {
                setScrollEnabled(true)
                setLoading(false)
                setInteractions([]) // Limpa interações após a resposta
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
