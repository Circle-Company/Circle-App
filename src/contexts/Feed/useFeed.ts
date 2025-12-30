import { Moment } from "@/contexts/Feed/types"
import React, { useCallback, useMemo, useState } from "react"

import { FeedOrchestrator } from "@/contexts/Feed/classes/orchestrator"
import { dataProps } from "@/components/moment/context/types"
import PersistedContext from "@/contexts/Persisted"
import { useCalculeCacheMaxSize } from "@/contexts/Feed/helpers/calculeCacheMaxSize"
import { useTimer } from "@/lib/hooks/useTimer"

export const useFeed = () => {
    const { session } = React.useContext(PersistedContext)

    const [feedData, setFeedData] = useState<Moment[]>([])
    const [loading, setLoading] = useState(false)
    const [scrollEnabled, setScrollEnabled] = useState(true)
    const [focusedChunkItem, setFocusedChunkItem] = useState<{ id: string; index: number } | null>(
        null,
    )
    const [commentEnabled, setCommentEnabled] = useState(false)
    const [focusedMoment, setFocusedMoment] = useState<dataProps>({} as dataProps)
    const [currentChunk, setCurrentChunk] = useState<string[]>([])
    const [period, setPeriod] = useState(0)
    const [keyboardVisible, setKeyboardVisible] = useState(false)

    const [resetTimer] = useTimer(1000, () => setPeriod((prev) => prev + 1))
    const maxCacheSize = useCalculeCacheMaxSize(feedData.length)

    // Criar instância do orchestrator com configurações
    const feedOrchestrator = useMemo(() => {
        if (!session.account.jwtToken) return null

        return new FeedOrchestrator(session.account.jwtToken, maxCacheSize)
    }, [session.account.jwtToken, maxCacheSize])

    const fetch = useCallback(
        async (isReloading = false) => {
            if (!session.user || !feedOrchestrator) {
                throw new Error("User not found or feedManager not initialized")
            }

            setScrollEnabled(false)
            setLoading(true)
            resetTimer()

            try {
                const { newFeed, addedChunk } = await feedOrchestrator
                    .fetch(feedData, isReloading)
                    .then((response) => {
                        console.log("🔍 Feed response:", response)
                        return response
                    })
                    .catch((error) => {
                        console.error("🔍 Error fetching feed:", error)
                        return { newFeed: [], addedChunk: [] }
                    })

                setFeedData(newFeed)
                setCurrentChunk(addedChunk)
            } catch (error) {
                console.error("Erro ao buscar feed:", error)
            } finally {
                setScrollEnabled(true)
                setLoading(false)
            }
        },
        [feedData, session.user, period, resetTimer, feedOrchestrator],
    )

    function setFocusedChunkItemFunc({ id }: { id: string }) {
        currentChunk.map((item, index) => {
            if (item === id) setFocusedChunkItem({ id, index })
        })
    }

    function next() {
        return (
            Number(focusedChunkItem?.index ?? +1) < feedData.length &&
            !commentEnabled &&
            !loading &&
            scrollEnabled
        )
    }

    function previous() {
        return Number(focusedChunkItem?.index) > 0 && !commentEnabled && !loading && scrollEnabled
    }

    const removeItemFromFeed = useCallback(
        async (id: string) => {
            if (!feedOrchestrator) return

            try {
                const { newFeed } = await feedOrchestrator.remove(id, feedData)
                setFeedData(newFeed)

                // Atualizar currentChunk removendo o item
                setCurrentChunk((prev) => prev.filter((itemId) => itemId !== id))

                // Se o item removido era o focado, limpar foco
                if (focusedChunkItem?.id === id) {
                    setFocusedChunkItem(null)
                }
            } catch (error) {
                console.error("Erro ao remover item do feed:", error)
            }
        },
        [feedOrchestrator, feedData, focusedChunkItem],
    )

    // Função para carregar vídeo do cache (quando o usuário foca no vídeo)
    const loadVideoFromCache = useCallback(
        async (momentId: string): Promise<string | null> => {
            if (!feedOrchestrator) return null

            try {
                const moment = feedData.find((m) => m.id === momentId)
                if (!moment) return null

                const videoUrl = moment.media
                if (!videoUrl) return null

                // Tentar carregar do cache primeiro
                const cachedUrl = await feedOrchestrator.getCached(momentId)
                if (cachedUrl) {
                    console.log(`Vídeo carregado do cache: ${momentId}`)
                    return cachedUrl
                }

                // Se não estiver em cache, fazer preload e retornar URL original
                console.log(`Vídeo não em cache, fazendo preload: ${momentId}`)
                feedOrchestrator.preloadSingle(momentId, videoUrl)
                return videoUrl
            } catch (error) {
                console.error("Erro ao carregar vídeo do cache:", error)
                return null
            }
        },
        [feedOrchestrator, feedData],
    )

    // Função para fazer preload do próximo vídeo
    const preloadNextVideo = useCallback(
        async (currentIndex: number) => {
            if (!feedOrchestrator || !feedData || feedData.length === 0) return

            const nextIndex = currentIndex + 1
            if (nextIndex >= feedData.length) return

            const nextMoment = feedData[nextIndex]
            if (!nextMoment) return

            const videoUrl = nextMoment.media
            if (!videoUrl) return

            try {
                // Verificar se já está em cache
                const cachedUrl = await feedOrchestrator.getCached(nextMoment.id)
                if (cachedUrl) {
                    console.log(`Próximo vídeo já em cache: ${nextMoment.id}`)
                    return
                }

                // Fazer preload do próximo vídeo
                console.log(`Fazendo preload do próximo vídeo: ${nextMoment.id}`)
                await feedOrchestrator.preloadSingle(nextMoment.id, videoUrl)
            } catch (error) {
                console.warn("Erro ao fazer preload do próximo vídeo:", error)
            }
        },
        [feedOrchestrator, feedData],
    )

    return {
        feedData,
        loading,
        scrollEnabled,
        focusedChunkItem,
        focusedMoment,
        currentChunk,
        commentEnabled,
        setCommentEnabled,
        setFocusedChunkItemFunc,
        setFocusedMoment,
        setScrollEnabled,
        keyboardVisible,
        setKeyboardVisible,
        next,
        previous,
        fetch,
        removeItemFromFeed,
        loadVideoFromCache,
        preloadNextVideo,
        reloadFeed: () => fetch(true),
        // Expor cacheManager e chunkManager para prefetch otimizado
        cacheManager: feedOrchestrator?.cacheManager,
        chunkManager: feedOrchestrator?.chunkManager,
        moments: feedData,
    }
}
