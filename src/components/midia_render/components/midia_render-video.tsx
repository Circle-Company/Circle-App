import { Animated, Image, StyleSheet, View } from "react-native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import Video, { OnLoadData, OnProgressData } from "react-native-video"

import MidiaRenderVideoError from "./midia_render-video_error"
import MomentContext from "../../moment/context"
import PersistedContext from "../../../contexts/Persisted"
import { t } from "i18next"

interface VideoPlayerProps {
    uri?: string
    thumbnailUri?: string
    hasVideoCache?: boolean
    autoPlay?: boolean
    onVideoLoad?: (duration: number) => void
    onVideoEnd?: () => void
    onProgressChange?: (currentTime: number, duration: number) => void
    style?: Record<string, unknown>
    showControls?: boolean
    blurRadius?: number
    isFocused?: boolean
    width?: number
    height?: number
    isLoadingCache?: boolean
    momentId?: string
    forceMute?: boolean
    prefetchAdjacentThumbnails?: string[]
}

export default function MediaRenderVideo({
    uri,
    thumbnailUri,
    hasVideoCache = false,
    autoPlay = true,
    onVideoLoad,
    onVideoEnd,
    onProgressChange,
    blurRadius = 10,
    isFocused = true,
    width,
    height,
    isLoadingCache = false,
    momentId,
    forceMute = false,
    prefetchAdjacentThumbnails = [],
}: VideoPlayerProps) {
    const { momentSize } = React.useContext(MomentContext)
    const videoWidth = momentSize?.width ?? width ?? 200
    const videoHeight = momentSize?.height ?? height ?? 200

    // Estados otimizados
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showThumbnail, setShowThumbnail] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const videoRef = useRef<Video>(null)
    const retryCount = useRef(0)
    const maxRetries = 2
    const isVideoReadyRef = useRef(false)

    const thumbnailSource = thumbnailUri || uri

    const { session } = React.useContext(PersistedContext)
    const isMuted = forceMute ? true : session?.preferences?.content?.muteAudio || false

    // Pré-carregar thumbnails adjacentes usando Image.prefetch
    useEffect(() => {
        if (prefetchAdjacentThumbnails.length > 0) {
            prefetchAdjacentThumbnails.forEach((thumbUrl) => {
                if (thumbUrl) {
                    Image.prefetch(thumbUrl).catch(() => {
                        // Silenciar erros de prefetch
                    })
                }
            })
        }
    }, [prefetchAdjacentThumbnails])

    // Pré-carregar thumbnail atual com prioridade máxima
    useEffect(() => {
        if (thumbnailSource) {
            Image.prefetch(thumbnailSource).catch(() => {
                // Silenciar erros de prefetch
            })
        }
    }, [thumbnailSource])

    // Controle de play/pause baseado em foco e autoPlay
    useEffect(() => {
        if (isFocused && autoPlay && isVideoReadyRef.current) {
            setIsPlaying(true)
        } else {
            setIsPlaying(false)
        }
    }, [isFocused, autoPlay])

    // Reset quando URI muda
    useEffect(() => {
        setShowThumbnail(true)
        isVideoReadyRef.current = false
        setHasError(false)
        retryCount.current = 0
    }, [uri])

    // Reset quando perde foco
    useEffect(() => {
        if (!isFocused) {
            setShowThumbnail(true)
            isVideoReadyRef.current = false
            if (videoRef.current) {
                videoRef.current.seek(0)
            }
        }
    }, [isFocused])

    const retryPlayback = useCallback(() => {
        if (retryCount.current < maxRetries) {
            console.log(
                `Tentando reproduzir o vídeo novamente. Tentativa ${
                    retryCount.current + 1
                } de ${maxRetries}`,
            )
            retryCount.current += 1
            setHasError(false)
            setShowThumbnail(true)
            isVideoReadyRef.current = false

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.seek(0)
                    if (isFocused && autoPlay) {
                        setIsPlaying(true)
                    }
                }
            }, 500)
        }
    }, [isFocused, autoPlay])

    const styles = StyleSheet.create({
        container: {
            alignItems: "center",
            backgroundColor: "transparent",
            height: videoHeight,
            justifyContent: "center",
            overflow: "hidden",
            width: videoWidth,
        },
        absoluteFill: {
            ...StyleSheet.absoluteFillObject,
        },
        thumbnail: {
            bottom: 0,
            height: "100%",
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
            width: "100%",
        },
        video: {
            backgroundColor: "transparent",
            height: "100%",
            width: "100%",
        },
    })

    // Handlers otimizados
    function handleLoad(data: OnLoadData) {
        const cacheStatus = hasVideoCache ? "(CACHE)" : "(REMOTO)"
        console.log(`Video loaded ${cacheStatus}:`, {
            momentId: momentId || "unknown",
            duration: data.duration,
        })
        setDuration(data.duration)
        retryCount.current = 0

        if (onVideoLoad) {
            onVideoLoad(data.duration)
        }
    }

    function handleReadyForDisplay() {
        console.log(`Video ready for display: ${momentId}`)
        isVideoReadyRef.current = true

        // Só esconder thumbnail se estiver focado
        if (isFocused) {
            // Pequeno delay para garantir que o primeiro frame está renderizado
            setTimeout(() => {
                setShowThumbnail(false)
            }, 100)

            // Garantir que está tocando se autoPlay estiver ativo
            if (autoPlay) {
                setIsPlaying(true)
            }
        }
    }

    function handleProgress(data: OnProgressData) {
        if (isFocused) {
            setCurrentTime(data.currentTime)
            if (onProgressChange) {
                onProgressChange(data.currentTime, duration)
            }
        }
    }

    function handleError(error: unknown) {
        console.error("Video error:", error)

        let errorMsg = t("Erro ao carregar o vídeo")

        if (error && typeof error === "object" && "error" in error) {
            const videoError = error as {
                error: { extra: number; what: number }
            }

            if (videoError.error.extra === -1005) {
                errorMsg = t("Não foi possível acessar o vídeo. Verifique sua conexão.")
            }
        }

        setErrorMessage(errorMsg)
        setHasError(true)
        setShowThumbnail(true)

        if (retryCount.current < maxRetries) {
            retryPlayback()
        } else {
            if (onVideoEnd) {
                onVideoEnd()
            }
        }
    }

    function handleEnd() {
        console.log("Video playback ended")
        // NÃO pausar! O repeat={true} faz o loop automaticamente
        if (onVideoEnd) {
            onVideoEnd()
        }
    }

    // Renderização com erro
    if (hasError && isFocused) {
        return (
            <View style={styles.container}>
                <Image
                    source={{ uri: thumbnailSource }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                    blurRadius={blurRadius}
                />
                <MidiaRenderVideoError
                    message={errorMessage}
                    onRetry={retryCount.current < maxRetries ? retryPlayback : undefined}
                />
            </View>
        )
    }

    // Renderização normal
    return (
        <View style={styles.container}>
            {/* Vídeo - sempre renderizado quando há URI */}
            {uri && uri.length > 0 && (
                <View style={styles.absoluteFill}>
                    <Video
                        ref={videoRef}
                        source={{ uri: uri }}
                        style={styles.video}
                        resizeMode="cover"
                        repeat={true}
                        paused={!isPlaying}
                        muted={isMuted}
                        controls={false}
                        onLoad={handleLoad}
                        onReadyForDisplay={handleReadyForDisplay}
                        onProgress={handleProgress}
                        onEnd={handleEnd}
                        onError={handleError}
                        ignoreSilentSwitch="ignore"
                        playInBackground={false}
                        posterResizeMode="cover"
                        poster={thumbnailSource}
                        bufferConfig={{
                            minBufferMs: 2500,
                            maxBufferMs: 5000,
                            bufferForPlaybackMs: 1000,
                            bufferForPlaybackAfterRebufferMs: 1500,
                        }}
                        maxBitRate={2000000}
                        reportBandwidth={true}
                    />
                </View>
            )}

            {/* Thumbnail - sempre visível até o vídeo estar pronto */}
            {showThumbnail && (
                <View style={[styles.absoluteFill, { zIndex: 10 }]} pointerEvents="none">
                    <Image
                        source={{ uri: thumbnailSource }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                        blurRadius={isFocused ? blurRadius : blurRadius * 0.6}
                        fadeDuration={0}
                        // Cache otimizado
                        cache="force-cache"
                    />
                </View>
            )}
        </View>
    )
}
