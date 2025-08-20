import React, { useCallback, useState, useMemo } from "react"
import PersistedContext from "@/contexts/Persisted"
import { useTimer } from "@/lib/hooks/useTimer"
import { feedMock } from "@/mocks/feedMock"
import { InteractionProps, MomentProps } from "@/contexts/Feed/types"
import { MomentDataProps } from "@/components/moment/context/types"
import { FeedOrchestrator } from "@/contexts/Feed/classes/orchestrator"

export const useFeed = () => {
    const { session } = React.useContext(PersistedContext)

    const [feedData, setFeedData] = useState<MomentProps[]>(feedMock)
    const [loading, setLoading] = useState(false)
    const [scrollEnabled, setScrollEnabled] = useState(true)
    const [focusedChunkItem, setFocusedChunkItem] = useState<{ id: number; index: number } | null>(
        null,
    )
    const [commentEnabled, setCommentEnabled] = useState(false)
    const [focusedMoment, setFocusedMoment] = useState<MomentDataProps>({} as MomentDataProps)
    const [currentChunk, setCurrentChunk] = useState<number[]>([])
    const [interactions, setInteractions] = useState<InteractionProps[]>([])
    const [period, setPeriod] = useState(0)

    const [resetTimer] = useTimer(1000, () => setPeriod((prev) => prev + 1))

    // Criar instância do orchestrator com configurações
    const feedOrchestrator = useMemo(() => {
        if (!session.account.jwtToken) return null

        return new FeedOrchestrator()
    }, [session.account.jwtToken])

    const fetch = useCallback(
        async (isReloading = false) => {
            if (!session.user || !feedOrchestrator) {
                throw new Error("User not found or feedManager not initialized")
            }

            setScrollEnabled(false)
            setLoading(true)
            resetTimer()

            try {
                const { newFeed, addedChunk } = await feedOrchestrator.fetch(
                    period,
                    interactions,
                    feedData,
                    isReloading,
                )

                setFeedData(newFeed)
                setCurrentChunk(addedChunk)
                setInteractions([])
            } catch (error) {
                console.error("Erro ao buscar feed:", error)
            } finally {
                setScrollEnabled(true)
                setLoading(false)
            }
        },
        [feedData, interactions, session.user, period, resetTimer, feedOrchestrator],
    )

    function setFocusedChunkItemFunc({ id }: { id: number }) {
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
        async (id: number) => {
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
        async (momentId: number): Promise<string | null> => {
            if (!feedOrchestrator) return null

            try {
                const moment = feedData.find((m) => m.id === momentId)
                if (!moment) return null

                const videoUrl = (moment as any)?.videoUrl
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

            const videoUrl = (nextMoment as any)?.videoUrl
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
        interactions,
        commentEnabled,
        setCommentEnabled,
        setFocusedChunkItemFunc,
        setInteractions,
        setFocusedMoment,
        setScrollEnabled,
        next,
        previous,
        fetch,
        removeItemFromFeed,
        loadVideoFromCache,
        preloadNextVideo,
        reloadFeed: () => fetch(true),
    }
}
