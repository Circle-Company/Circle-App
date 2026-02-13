import React, { useCallback, useEffect, useState, useMemo } from "react"
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated"
import ColorTheme from "@/constants/colors"
import FeedContext from "@/contexts/Feed"
import MediaRenderVideo from "@/components/midia_render/components/midia_render-video"
import { MidiaRender } from "@/components/midia_render"
import { MomentContainerProps } from "../moment-types"
import MomentContext from "../context"
import MomentVideoSlider from "./moment-video-slider"
import PersistedContext from "@/contexts/Persisted"
import { UserShow } from "@/components/user_show"
import { View } from "react-native"
import { Text } from "@/components/Themed"

export default function Container({
    children,
    contentRender,
    isFocused = true,
    onVideoEnd,
    forceMute = false,
    showSlider = true,
    blurRadius = 15,
    disableCache = false,
    disableWatch = false,
}: MomentContainerProps & { onVideoEnd?: () => void }) {
    const { data, actions, size, options, video } = React.useContext(MomentContext)
    const { session } = React.useContext(PersistedContext)
    const feedContext = React.useContext(FeedContext)
    const { commentEnabled, loadVideoFromCache, cacheManager, chunkManager, moments } =
        feedContext || {}
    const [hasVideoCache, setHasVideoCache] = useState<boolean>(false)
    const [cachedVideoUri, setCachedVideoUri] = useState<string | undefined>()
    const [isLoadingCache, setIsLoadingCache] = useState(false)
    const [adjacentThumbnails, setAdjacentThumbnails] = useState<string[]>([])
    const [hidden, setHidden] = useState<boolean>(options?.hide === true)

    // Atualizar o estado de pausa do vídeo quando muda o foco (evitar loops)
    useEffect(() => {
        const shouldPause = !isFocused || !!commentEnabled || hidden === true
        if (video.isPaused !== shouldPause) {
            video.setIsPaused(shouldPause)
        }
    }, [isFocused, commentEnabled, hidden, video.isPaused])

    // Espelha options.hide em estado local para garantir re-render quando mudar
    useEffect(() => {
        setHidden(!!options.hide)
    }, [options.hide])

    const container: any = {
        ...size,
        overflow: "hidden",
        backgroundColor: ColorTheme().backgroundDisabled,
    }
    const content_container: any = {
        flex: 1,
        position: "absolute",
        width: size.width,
        height: size.height,
        zIndex: 0,
    }

    const tiny_container: any = {
        width: size.width * 0.31,
        height: size.height * 0.31,
        position: "absolute",
        alignItems: "flex-start",
        flexDirection: "row",
        top: 190,
        left: 120,
        flex: 1,
        zIndex: 1,
        transform: [{ scale: 3 }],
    }

    const sliderContainerStyle = {
        position: "absolute" as const,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    }

    // Função para carregar vídeo do cache otimizado
    const loadVideoFromCacheOptimized = useCallback(async () => {
        if (!data.media) return

        // Se cache desabilitado, usar URL direta
        if (disableCache || !loadVideoFromCache) {
            setCachedVideoUri(data.media)
            setHasVideoCache(false)
            return
        }

        setIsLoadingCache(true)

        try {
            // Usar o sistema de cache do Feed
            const cachedUrl = await loadVideoFromCache(String(data.id))

            if (cachedUrl) {
                setCachedVideoUri(cachedUrl)
                setHasVideoCache(cachedUrl.startsWith("file://"))
            } else {
                // Fallback para URL original
                setCachedVideoUri(data.media)
                setHasVideoCache(false)
            }
        } catch (error) {
            setCachedVideoUri(data.media)
            setHasVideoCache(false)
        } finally {
            setIsLoadingCache(false)
        }
    }, [data.id, data.media, loadVideoFromCache, disableCache])

    // Pré-carregar thumbnails e vídeos adjacentes
    useEffect(() => {
        if (disableCache || !cacheManager || !chunkManager || !moments) return

        const currentId = String(data.id)
        const neighbors = chunkManager.getNeighborIds(currentId, 3)

        // Pré-carregar thumbnails dos vizinhos
        const thumbnailUrls: string[] = []
        const videoItems: Array<{ id: string; url: string }> = []
        const thumbnailItems: Array<{ id: string; url: string }> = []

        neighbors.all.forEach((neighborId) => {
            const neighborMoment = moments.find((m) => String(m.id) === neighborId)
            if (neighborMoment) {
                if (neighborMoment.thumbnail) {
                    thumbnailUrls.push(neighborMoment.thumbnail)
                    thumbnailItems.push({ id: neighborId, url: neighborMoment.thumbnail })
                }

                if (neighborMoment.media)
                    videoItems.push({ id: neighborId, url: neighborMoment.media })
            }
        })

        setAdjacentThumbnails(thumbnailUrls)

        // Pré-carregar thumbnails em lote (alta prioridade para os próximos 2, baixa para o resto)
        if (thumbnailItems.length > 0) {
            const highPriorityThumbnails = thumbnailItems.slice(0, 2)
            const lowPriorityThumbnails = thumbnailItems.slice(2)

            cacheManager.preloadThumbnailsBatch(highPriorityThumbnails, "high")
            if (lowPriorityThumbnails.length > 0) {
                cacheManager.preloadThumbnailsBatch(lowPriorityThumbnails, "low")
            }
        }

        // Pré-carregar vídeos adjacentes com baixa prioridade (não bloqueia o atual)
        if (videoItems.length > 0) {
            cacheManager.preloadVideosBatch(videoItems, "low")
        }
    }, [data.id, cacheManager, chunkManager, moments])

    // Carregar vídeo quando o componente montar (independente do foco para pré-carregar thumbnail)
    useEffect(() => {
        loadVideoFromCacheOptimized()
    }, [data.id, loadVideoFromCacheOptimized])

    // Pré-carregar thumbnail do momento atual com prioridade máxima
    useEffect(() => {
        if (!disableCache && cacheManager && data.thumbnail) {
            cacheManager.preloadThumbnail({
                id: String(data.id),
                url: data.thumbnail,
                priority: "high",
            })
        }
    }, [data.id, data.thumbnail, cacheManager, disableCache])

    // Resetar estado do slider ao trocar de momento (evita exibir slider sem duração)
    useEffect(() => {
        if (video?.setCurrentTime) video.setCurrentTime(0)
        if (video?.setDuration) video.setDuration(0)
    }, [data.id])

    async function handleDoublePress() {
        if (data.user.id != session.user.id) actions.registerInteraction("LIKE")
    }

    function handleProgressChange(currentTime: number, duration: number) {
        video.setCurrentTime(currentTime)
        video.setDuration(duration)
    }

    const renderVideoContent = () => {
        // Sempre renderiza o componente de vídeo para pré-carregar a thumbnail
        // O componente interno controla a visibilidade através da prop isFocused
        return (
            <View style={{ width: size.width, height: size.height }}>
                <MediaRenderVideo
                    uri={cachedVideoUri ?? data.media}
                    thumbnailUri={data.thumbnail}
                    hasVideoCache={hasVideoCache}
                    isLoadingCache={isLoadingCache}
                    momentId={data.id}
                    autoPlay={!video.isPaused}
                    style={{
                        width: size.width,
                        height: size.height,
                    }}
                    onVideoLoad={(duration) => {
                        video.setDuration(duration)
                    }}
                    onVideoEnd={() => {
                        if (onVideoEnd) onVideoEnd()
                    }}
                    onProgressChange={handleProgressChange}
                    isFocused={isFocused}
                    blurRadius={blurRadius}
                    prefetchAdjacentThumbnails={adjacentThumbnails}
                    forceMute={forceMute}
                    disableWatch={disableWatch}
                />
            </View>
        )
    }

    /**
    async function handleSinglePress() {
        if (!commentEnabled && options.isFeed) {
            if (!fromFullMomentScreen && isFocused) {
                actions.setClickIntoMoment(true)
                setFocusedMoment({
                    id: data.id,
                    user: data.user,
                    description: data.description,
                    midia: data.midia,
                    comments: data.comments,
                    statistics: data.statistics,
                    tags: data.tags,
                    language: data.language,
                    created_at: data.created_at,
                    is_liked: actions.liked,
                })
            }
            navigation.navigate("MomentNavigator", { screen: "DetailScreen" })
        }
    }
*/
    if (hidden) {
        return null
    } else {
        return (
            <View style={container}>
                <View style={content_container}>
                    <MidiaRender.Root data={contentRender} content_sizes={size}>
                        {renderVideoContent()}
                    </MidiaRender.Root>
                </View>

                {/* Controles de vídeo (áudio e slider) */}
                {isFocused &&
                    !commentEnabled &&
                    showSlider &&
                    Number.isFinite(video.duration) &&
                    video.duration > 0 && (
                        <View style={sliderContainerStyle} pointerEvents="box-none">
                            <MomentVideoSlider
                                width={size.width * 0.95}
                                currentTime={video.currentTime}
                                duration={video.duration}
                            />
                        </View>
                    )}

                {isFocused ? children : null}
            </View>
        )
    }
}
