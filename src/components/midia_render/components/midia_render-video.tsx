import { Image, StyleSheet, View, Pressable, Platform, ImageProps } from "react-native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { VideoView, useVideoPlayer } from "expo-video"
import * as VideoThumbnails from "expo-video-thumbnails"
import * as FileSystem from "expo-file-system"

import MidiaRenderVideoError from "./midia_render-video_error"
import MomentContext from "../../moment/context"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "@/contexts/Preferences/language"

// Componente de imagem otimizado que desabilita análises do iOS
const OptimizedImage = React.memo(
    ({ style, ...props }: ImageProps) => {
        return (
            <Image
                {...props}
                style={style}
                accessible={false}
                accessibilityIgnoresInvertColors={true}
                // @ts-ignore - propriedade não documentada do iOS para desabilitar VisionKit
                enableLiveTextInteraction={false}
            />
        )
    },
    (prevProps, nextProps) => {
        // Memoização customizada - só re-renderiza se a URI mudar
        return (
            prevProps.source === nextProps.source && prevProps.blurRadius === nextProps.blurRadius
        )
    },
)

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
    const { t } = React.useContext(LanguageContext)
    const { momentSize } = React.useContext(MomentContext)
    const videoWidth = momentSize?.width ?? width ?? 200
    const videoHeight = momentSize?.height ?? height ?? 200

    // Estados otimizados
    const [hasError, setHasError] = useState(false)
    const [showThumbnail, setShowThumbnail] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null)
    const retryCount = useRef(0)
    const maxRetries = 2
    const isVideoReadyRef = useRef(false)
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const destroyedRef = useRef(false)
    const attachedRef = useRef(false)

    const { session } = React.useContext(PersistedContext)
    const isMuted = forceMute ? true : session?.preferences?.content?.muteAudio || false

    // Configurar player do expo-video
    const player = useVideoPlayer("", () => {
        // Defer configuration until the player is attached (readyToPlay)
    })

    // Usar thumbnail fornecida ou gerar uma do vídeo
    const thumbnailSource = thumbnailUri || generatedThumbnail || uri

    // Gerar thumbnail do vídeo se não houver uma fornecida
    useEffect(() => {
        if (!thumbnailUri && uri && !generatedThumbnail) {
            VideoThumbnails.getThumbnailAsync(uri, {
                time: 0,
                quality: 0.5,
            })
                .then((result) => {
                    setGeneratedThumbnail(result.uri)
                })
                .catch((error) => {
                    console.warn("Erro ao gerar thumbnail:", error)
                })
        }
    }, [uri, thumbnailUri, generatedThumbnail])

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
        if (!player) return
        if (isFocused && autoPlay && isVideoReadyRef.current && attachedRef.current) {
            try {
                player.play()
                setShowThumbnail(false)
            } catch (e) {
                // evita erro quando o objeto nativo ainda não está anexado
            }
        } else if (isVideoReadyRef.current && attachedRef.current) {
            try {
                player.pause()
            } catch (e) {
                // evita erro quando o objeto nativo ainda não está anexado
            }
        }
    }, [isFocused, autoPlay, player])

    // Garantir que, ao focar e o vídeo já estiver pronto, esconda a thumbnail
    useEffect(() => {
        if (isFocused && isVideoReadyRef.current) {
            setShowThumbnail(false)
        }
    }, [isFocused])

    // Reset quando URI muda
    useEffect(() => {
        setShowThumbnail(true)
        isVideoReadyRef.current = false
        attachedRef.current = false
        setHasError(false)
        retryCount.current = 0
        setGeneratedThumbnail(null)
    }, [uri])

    // Trocar a fonte do player quando a URI mudar: validar local file antes de substituir
    useEffect(() => {
        let cancelled = false
        async function validateAndReplace(nextUri?: string) {
            if (!player) return
            let safe = ""
            if (nextUri && typeof nextUri === "string") {
                if (nextUri.startsWith("file://")) {
                    try {
                        const info = await FileSystem.getInfoAsync(nextUri)
                        if (info.exists && (info.size ?? 0) > 0) {
                            safe = nextUri
                        }
                    } catch {
                        safe = ""
                    }
                } else {
                    // http/https ou outros esquemas: usar direto
                    safe = nextUri
                }
            }
            if (!cancelled) {
                try {
                    if (safe) {
                        const anyPlayer = player as any
                        if (typeof anyPlayer.replaceAsync === "function") {
                            await anyPlayer.replaceAsync(safe)
                        } else if (typeof anyPlayer.replace === "function") {
                            anyPlayer.replace(safe)
                        }
                    }
                } catch {}
            }
        }
        validateAndReplace(uri)
        return () => {
            cancelled = true
        }
    }, [uri, player])

    // Reset quando perde foco
    useEffect(() => {
        if (!isFocused && player) {
            setShowThumbnail(true)
            // não chame APIs se o nativo não estiver anexado
            if (attachedRef.current) {
                try {
                    player.pause()
                } catch (e) {}
                try {
                    player.currentTime = 0
                } catch (e) {}
            }
        }
    }, [isFocused, player])

    // Monitorar status do player
    useEffect(() => {
        if (!player) return

        // Listener para quando o vídeo carregar
        const loadSub = player.addListener("statusChange", (status) => {
            if (status.status === "readyToPlay") {
                const duration = player.duration || 0
                console.log(`Video loaded:`, {
                    momentId: momentId || "unknown",
                    duration,
                })
                retryCount.current = 0

                if (onVideoLoad) {
                    onVideoLoad(duration)
                }

                isVideoReadyRef.current = true
                try {
                    player.loop = true
                    player.muted = isMuted
                    player.volume = isMuted ? 0 : 1
                } catch (e) {}
                attachedRef.current = true

                // Esconder thumbnail quando vídeo estiver pronto
                if (isFocused) {
                    setTimeout(() => {
                        setShowThumbnail(false)
                    }, 60)

                    if (autoPlay && attachedRef.current) {
                        try {
                            player.play()
                        } catch (e) {
                            // se falhar, será retomado pelo efeito de foco quando estiver pronto
                        }
                    }
                }
            } else if (status.status === "error") {
                attachedRef.current = false
                handleError(status.error)
            }
        })

        // Listener para play/pause (esconde thumbnail ao iniciar)
        const playSub = player.addListener("playingChange", (isPlaying) => {
            if (isPlaying && isVideoReadyRef.current) {
                setShowThumbnail(false)
            }
            if (!isPlaying && player.currentTime >= (player.duration || 0) - 0.1) {
                console.log("Video playback ended")
                if (onVideoEnd) {
                    onVideoEnd()
                }
            }
        })

        return () => {
            loadSub.remove()
            playSub.remove()
        }
    }, [player, isFocused, autoPlay, onVideoLoad, onVideoEnd, momentId])

    // Monitorar progresso do vídeo
    useEffect(() => {
        if (!player || !isFocused || !onProgressChange) return
        if (!attachedRef.current) return

        // Atualizar progresso a cada 120ms
        progressIntervalRef.current = setInterval(() => {
            if (
                attachedRef.current &&
                player.currentTime !== undefined &&
                player.duration !== undefined
            ) {
                onProgressChange(player.currentTime, player.duration)
            }
        }, 120)

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
            }
        }
    }, [player, isFocused, onProgressChange])

    // Atualizar mute quando mudar
    useEffect(() => {
        if (player && attachedRef.current) {
            try {
                player.muted = isMuted
                player.volume = isMuted ? 0 : 1
            } catch (e) {}
        }
    }, [isMuted, player])

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
            attachedRef.current = false

            setTimeout(() => {
                if (destroyedRef.current) return
                if (player && isFocused && autoPlay && attachedRef.current) {
                    try {
                        player.currentTime = 0
                    } catch (e) {}
                    try {
                        player.play()
                    } catch (e) {}
                }
            }, 400)
        }
    }, [player, isFocused, autoPlay])

    const handleError = useCallback(
        (error: any) => {
            console.error("Video error:", error)

            let errorMsg = t("Erro ao carregar o vídeo")

            if (error && typeof error === "object") {
                if (error.message && error.message.includes("network")) {
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
        },
        [retryPlayback, onVideoEnd],
    )

    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            destroyedRef.current = true
            if (player && attachedRef.current) {
                try {
                    player.pause()
                } catch (e) {}
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
            }
        }
    }, [player])

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
            height: "100%",
            width: "100%",
        },
    })

    // Renderização com erro
    if (hasError && isFocused) {
        return (
            <View style={styles.container}>
                <OptimizedImage
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
    return Platform.OS === "ios" ? (
        <Pressable onLongPress={() => {}} delayLongPress={100000} style={styles.container}>
            {/* Vídeo - sempre renderizado quando há URI */}
            {uri && uri.length > 0 && player && (
                <View style={styles.absoluteFill}>
                    <VideoView
                        player={player}
                        style={styles.video}
                        contentFit="cover"
                        nativeControls={false}
                        allowsFullscreen={false}
                        allowsPictureInPicture={false}
                        accessible={false}
                    />
                </View>
            )}

            {/* Thumbnail - sempre visível até o vídeo estar pronto */}
            {showThumbnail && (
                <View style={[styles.absoluteFill, { zIndex: 10 }]} pointerEvents="none">
                    <OptimizedImage
                        source={{ uri: thumbnailSource }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                        blurRadius={isFocused ? blurRadius : blurRadius * 0.6}
                        fadeDuration={0}
                    />
                </View>
            )}
        </Pressable>
    ) : (
        <View style={styles.container}>
            {/* Vídeo - sempre renderizado quando há URI */}
            {uri && uri.length > 0 && player && (
                <View style={styles.absoluteFill}>
                    <VideoView
                        player={player}
                        style={styles.video}
                        contentFit="cover"
                        nativeControls={false}
                        allowsFullscreen={false}
                        allowsPictureInPicture={false}
                        accessible={false}
                    />
                </View>
            )}

            {/* Thumbnail - sempre visível até o vídeo estar pronto */}
            {showThumbnail && (
                <View style={[styles.absoluteFill, { zIndex: 10 }]} pointerEvents="none">
                    <OptimizedImage
                        source={{ uri: thumbnailSource }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                        blurRadius={isFocused ? blurRadius : blurRadius * 0.6}
                        fadeDuration={0}
                    />
                </View>
            )}
        </View>
    )
}
