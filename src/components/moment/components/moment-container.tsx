import React, { useCallback, useEffect, useState, useMemo } from "react"
import { useIsFocused } from "expo-router"
import ColorTheme from "@/constants/colors"
import FeedContext from "@/contexts/Feed"
import MediaRenderVideo from "@/components/midia_render/components/midia_render-video"
import { MidiaRender } from "@/components/midia_render"
import { MomentReportModal } from "./moment-report.modal"
import { MomentContainerProps } from "../moment-types"
import MomentContext from "../context"
import MomentVideoSlider from "./moment-video-slider"
import PersistedContext from "@/contexts/Persisted"
import { View } from "react-native"
import { Hidden } from "./moment-hidden"
import { SwiftBottomSheet } from "@/components/ios/ios.bottom.sheet"

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
    // Foco da TELA (não do momento dentro do carrossel): sai da aba do feed,
    // abre um perfil ou troca para a conta → a tela deixa de estar focada e o
    // vídeo tem que parar, inclusive o áudio.
    const isScreenFocused = useIsFocused()
    const { data, actions, size, options, video } = React.useContext(MomentContext)
    const { session } = React.useContext(PersistedContext)
    const feedContext = React.useContext(FeedContext)
    const {
        commentEnabled,
        getCachedVideoSync,
        resolveVideo,
        prefetchAround,
        prefetchThumbnail,
    } = feedContext || {}
    // Consulta SÍNCRONA ao cache já no primeiro render. Sem isso o player era
    // criado com a URL remota e só depois trocava para o arquivo local — troca
    // de `uri` que reinicia o player e reexibe a thumbnail, exatamente o
    // "carrega de novo" ao vir do feed para o perfil / tela cheia.
    const cachedOnMount =
        !disableCache && data.id ? getCachedVideoSync?.(String(data.id)) : undefined
    const [hasVideoCache, setHasVideoCache] = useState<boolean>(Boolean(cachedOnMount))
    const [cachedVideoUri, setCachedVideoUri] = useState<string | undefined>(cachedOnMount)
    const [isLoadingCache, setIsLoadingCache] = useState(false)
    const [adjacentThumbnails, setAdjacentThumbnails] = useState<string[]>([])

    // Atualizar o estado de pausa do vídeo quando muda o foco (evitar loops)
    useEffect(() => {
        // `commentEnabled` não entra aqui: o vídeo deve continuar rodando
        // enquanto o usuário escreve o comentário.
        const shouldPause = !isFocused || !isScreenFocused || options.isHidden === true
        if (video.isPaused !== shouldPause) {
            video.setIsPaused(shouldPause)
        }
    }, [isFocused, isScreenFocused, options.isHidden, video.isPaused])

    const container: any = {
        ...size,
        // O padding do `size` deslocava o vídeo (content_container absoluto sem
        // top/left assumia a posição estática = padding), fazendo a base e a
        // direita do vídeo estourarem a borda e serem cortadas pelo overflow.
        // O vídeo deve ser full-bleed; os overlays (Top/Center/Bottom) já têm o
        // próprio padding interno.
        padding: 0,
        paddingTop: 0,
        overflow: "hidden",
        backgroundColor: ColorTheme().backgroundDisabled,
    }
    const content_container: any = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
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
        if (disableCache || !resolveVideo) {
            setCachedVideoUri(data.media)
            setHasVideoCache(false)
            return
        }

        // Já em cache (inclusive quando a célula é reciclada para outro id):
        // resolve sem passar pela URL remota, evitando a troca de `uri`.
        const immediate = getCachedVideoSync?.(String(data.id))
        if (immediate) {
            setCachedVideoUri(immediate)
            setHasVideoCache(true)
            return
        }

        setIsLoadingCache(true)

        try {
            const resolved = await resolveVideo(String(data.id), data.media)

            if (resolved) {
                setCachedVideoUri(resolved)
                setHasVideoCache(resolved.startsWith("file://"))
            } else {
                setCachedVideoUri(data.media)
                setHasVideoCache(false)
            }
        } catch (error) {
            setCachedVideoUri(data.media)
            setHasVideoCache(false)
        } finally {
            setIsLoadingCache(false)
        }
    }, [data.id, data.media, resolveVideo, getCachedVideoSync, disableCache])

    // Pré-carregar thumbnails e vídeos adjacentes. A escolha dos vizinhos e a
    // priorização ficam no orquestrador (ChunkManager + CacheManager); aqui só
    // guardamos as thumbnails devolvidas para o prefetch na camada de imagem.
    // Fora do feed `prefetchAround` devolve vazio: o momento não está no chunk.
    useEffect(() => {
        if (disableCache || !prefetchAround) return
        setAdjacentThumbnails(prefetchAround(String(data.id), 3))
    }, [data.id, prefetchAround, disableCache])

    // Carregar vídeo quando o componente montar (independente do foco para pré-carregar thumbnail)
    useEffect(() => {
        loadVideoFromCacheOptimized()
    }, [data.id, loadVideoFromCacheOptimized])

    // Pré-carregar thumbnail do momento atual com prioridade máxima
    useEffect(() => {
        if (!disableCache && prefetchThumbnail && data.thumbnail) {
            prefetchThumbnail(String(data.id), data.thumbnail)
        }
    }, [data.id, data.thumbnail, prefetchThumbnail, disableCache])

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

    const renderVideoContent = ({ isHidden }: { isHidden: boolean }) => {
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
                    autoPlay={isHidden ? false : !video.isPaused}
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
                    isFocused={isHidden ? false : true}
                    blurRadius={isHidden ? 40 : blurRadius}
                    prefetchAdjacentThumbnails={adjacentThumbnails}
                    // Com a tela fora de foco, mutar além de pausar: garante
                    // silêncio mesmo na janela em que o player ainda não
                    // processou a pausa.
                    forceMute={forceMute || !isScreenFocused}
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
    if (options.isHidden)
        return (
            <View style={container}>
                <View style={content_container}>
                    <MidiaRender.Root data={contentRender} content_sizes={size}>
                        <Hidden width={contentRender?.width} height={contentRender?.height} />
                        {renderVideoContent({ isHidden: true })}
                    </MidiaRender.Root>
                </View>
                {options.showReportModal && (
                    <SwiftBottomSheet
                        snapPoints={[0.8]}
                        isOpened={options.showReportModal}
                        onIsOpenedChange={(opened) => {
                            if (!opened) options.setShowReportModal(false)
                        }}
                    >
                        <MomentReportModal />
                    </SwiftBottomSheet>
                )}
            </View>
        )
    else
        return (
            <View style={container}>
                <View style={content_container}>
                    <MidiaRender.Root data={contentRender} content_sizes={size}>
                        {renderVideoContent({ isHidden: false })}
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
                {options.showReportModal && (
                    <SwiftBottomSheet
                        snapPoints={[1]}
                        isOpened={options.showReportModal}
                        onIsOpenedChange={(opened) => {
                            if (!opened) options.setShowReportModal(false)
                        }}
                    >
                        <MomentReportModal />
                    </SwiftBottomSheet>
                )}
            </View>
        )
}
