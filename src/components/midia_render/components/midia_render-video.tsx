import { Image, StyleSheet, View, Platform, ImageProps } from "react-native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { VideoView, useVideoPlayer } from "expo-video"
import * as VideoThumbnails from "expo-video-thumbnails"
import * as FileSystem from "expo-file-system"

import MidiaRenderVideoError from "./midia_render-video_error"
import MomentContext from "../../moment/context"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "@/contexts/language"

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
    disableWatch?: boolean
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
    disableWatch = false,
}: VideoPlayerProps) {
    const { t } = React.useContext(LanguageContext)
    const { size, actions, data, video } = React.useContext(MomentContext)
    const videoWidth = size?.width ?? width ?? 200
    const videoHeight = size?.height ?? height ?? 200

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
    const lastWatchTimeRef = useRef(0) // Rastreia tempo total assistido
    const watchSessionStartRef = useRef(0) // Marca início da sessão de visualização
    const lastPositionRef = useRef(0) // Rastreia última posição para detectar loop

    const { session } = React.useContext(PersistedContext)
    const isMuted = forceMute
        ? true
        : (video?.isMuted ?? (session?.preferences?.content?.muteAudio || false))
    const latestIsMutedRef = useRef(isMuted)

    // Configurar player do expo-video.
    // Passar `null` evita que o expo-video interprete string vazia como URL relativa
    // (que vira `file:///` e dispara AVFoundationErrorDomain Code=-11828).
    // A URI real é atribuída via replaceAsync no useEffect abaixo, após validação.
    const player = useVideoPlayer(null, () => {
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

    // Função para registrar tempo assistido
    const registerWatchTime = useCallback(() => {
        if (disableWatch) return
        // Guardas defensivos para evitar acesso ao player nativo quando não está anexado
        const effectiveMomentId = data?.id || momentId
        if (!player || !effectiveMomentId || !session?.account?.jwtToken) {
            console.log("WATCH skip: missing deps", {
                hasPlayer: !!player,
                hasMoment: !!data?.id,
                hasMomentFallback: !!momentId,
                hasToken: !!session?.account?.jwtToken,
            })
            return
        }

        if (destroyedRef.current || !attachedRef.current) {
            console.log("WATCH skip: player not attached or destroyed", {
                destroyed: destroyedRef.current,
                attached: attachedRef.current,
            })
            return
        }

        let currentTime = 0
        try {
            // Alguns acessos podem lançar se o objeto nativo foi desalocado
            // @ts-ignore
            currentTime = player.currentTime || 0
            if (typeof currentTime !== "number" || !isFinite(currentTime)) currentTime = 0
        } catch (e) {
            console.warn("WATCH skip: failed to read currentTime", e)
            return
        }

        const watchedTime = currentTime - (watchSessionStartRef.current || 0)

        // Só registra se assistiu pelo menos 100ms
        if (watchedTime >= 0.1) {
            const totalWatchTime = (lastWatchTimeRef.current || 0) + watchedTime

            console.log(
                "Registrando WATCH - Tempo:",
                Math.round(watchedTime * 100) / 100,
                "s (total:",
                Math.round(totalWatchTime * 100) / 100,
                "s)",
            )

            actions.registerInteraction("WATCH", {
                momentId: effectiveMomentId,
                authorizationToken: session.account.jwtToken,
                watchTime: Math.round(totalWatchTime * 1000), // Converter para milissegundos
            })

            lastWatchTimeRef.current = totalWatchTime
        } else {
            console.log("WATCH skip: below threshold", { watchedTime })
        }

        // Reseta marcador de sessão
        watchSessionStartRef.current = 0
    }, [player, data?.id, session?.account?.jwtToken, actions])

    // Controle de play/pause baseado em foco e autoPlay
    useEffect(() => {
        if (!player) return
        if (isFocused && autoPlay && isVideoReadyRef.current && attachedRef.current) {
            try {
                player.play()
                setShowThumbnail(false)
                // Marca início da sessão de visualização
                watchSessionStartRef.current = player.currentTime || 0
            } catch (e) {
                // evita erro quando o objeto nativo ainda não está anexado
            }
        } else if (isVideoReadyRef.current && attachedRef.current) {
            try {
                player.pause()
                // Registra tempo assistido quando pausar/perder foco
                registerWatchTime()
            } catch (e) {
                // evita erro quando o objeto nativo ainda não está anexado
            }
        }
    }, [isFocused, autoPlay, player])

    // Garantir que, ao focar e o vídeo já estiver pronto, esconda a thumbnail apenas quando anexado
    useEffect(() => {
        if (isFocused && isVideoReadyRef.current && attachedRef.current) {
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
                console.log("Video loaded - duration:", duration)
                retryCount.current = 0

                if (onVideoLoad) {
                    onVideoLoad(duration)
                }

                isVideoReadyRef.current = true
                try {
                    player.loop = true
                    const mutedNow = latestIsMutedRef.current
                    player.muted = mutedNow
                    player.volume = mutedNow ? 0 : 1
                } catch (e) {}
                attachedRef.current = true
                console.log("Video attached", { momentId, uri })

                // Esconder thumbnail quando vídeo estiver pronto
                if (isFocused) {
                    setTimeout(() => {
                        setShowThumbnail(false)
                    }, 60)

                    if (autoPlay && attachedRef.current) {
                        try {
                            player.play()
                            // Marca início da sessão quando começar a tocar
                            watchSessionStartRef.current = player.currentTime || 0
                            lastPositionRef.current = player.currentTime || 0
                        } catch (e) {
                            // se falhar, será retomado pelo efeito de foco quando estiver pronto
                        }
                    }
                }
            } else if (status.status === "error") {
                attachedRef.current = false
                console.log("Video error statusChange", { momentId, uri, error: status.error })
                handleError(status.error)
            }
        })

        // Listener para play/pause (esconde thumbnail ao iniciar)
        const playSub = player.addListener("playingChange", (isPlaying) => {
            if (isPlaying && isVideoReadyRef.current) {
                setShowThumbnail(false)
                // Marca início da sessão quando começa a tocar
                watchSessionStartRef.current = player.currentTime || 0
            }
            if (!isPlaying && player.currentTime >= (player.duration || 0) - 0.1) {
                if (!disableWatch) {
                    console.log("Video playback ended - registrando watch time")
                    // Registra tempo assistido quando vídeo terminar
                    registerWatchTime()
                }

                if (onVideoEnd) {
                    onVideoEnd()
                }
            }
        })

        return () => {
            loadSub.remove()
            playSub.remove()
        }
    }, [player, isFocused, autoPlay, onVideoLoad, onVideoEnd, momentId, registerWatchTime])

    // Monitorar progresso do vídeo e detectar loops
    useEffect(() => {
        if (!player || !isFocused) return
        if (!attachedRef.current) return

        // Atualizar progresso e detectar loop a cada 120ms
        progressIntervalRef.current = setInterval(() => {
            if (
                attachedRef.current &&
                player.currentTime !== undefined &&
                player.duration !== undefined
            ) {
                const currentTime = player.currentTime
                const duration = player.duration

                // Detecta se o vídeo voltou ao início (loop)
                if (
                    lastPositionRef.current > 0 &&
                    currentTime < 0.5 &&
                    lastPositionRef.current > duration - 1
                ) {
                    if (!disableWatch) {
                        console.log("Loop detectado - registrando watch time")
                        registerWatchTime()
                    }
                    // Reinicia contadores para nova sessão
                    watchSessionStartRef.current = currentTime
                }

                lastPositionRef.current = currentTime

                // Callback de progresso se fornecido
                if (onProgressChange) {
                    onProgressChange(currentTime, duration)
                }
            }
        }, 120)

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
            }
        }
    }, [player, isFocused, onProgressChange, registerWatchTime])

    // Atualizar mute quando mudar
    useEffect(() => {
        latestIsMutedRef.current = isMuted
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

            if (destroyedRef.current) return
            if (player && uri) {
                try {
                    const anyPlayer = player as any
                    if (typeof anyPlayer.replaceAsync === "function") {
                        anyPlayer.replaceAsync(uri)
                    } else if (typeof anyPlayer.replace === "function") {
                        anyPlayer.replace(uri)
                    }
                } catch (e) {}
            }
            // autoplay will be handled on statusChange when readyToPlay
        }
    }, [player, isFocused, autoPlay, registerWatchTime])

    const handleError = useCallback(
        (error: any) => {
            // Registra tempo assistido antes de mostrar erro (se habilitado)
            if (!disableWatch) {
                console.log("🔴 Vídeo com erro - Registrando tempo assistido automaticamente")
                registerWatchTime()
            }
            console.error("Video error:", error)

            let errorMsg = t("Error to load moment")

            if (error && typeof error === "object") {
                if (error.message && error.message.includes("network")) {
                    errorMsg = t("Cannot possible load moment, check your internet connection")
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
        [retryPlayback, onVideoEnd, registerWatchTime],
    )

    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            // Registra tempo assistido ao desmontar componente
            registerWatchTime()

            // Desanexa antes de marcar como destruído para evitar estados inconsistentes
            attachedRef.current = false
            destroyedRef.current = true
            if (player) {
                try {
                    player.pause()
                } catch (e) {}
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
            }
        }
    }, [])

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
            // Explicit pixel sizing instead of "100%" — expo-video's VideoView in iOS 27 +
            // Fabric occasionally fails to compute % sizing inside absoluteFillObject, leaving
            // the AVPlayerLayer at zero frame so frames flow but nothing is painted.
            height: videoHeight,
            width: videoWidth,
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
        <View style={styles.container}>
            {/* Vídeo - sempre renderizado quando há URI */}
            {uri && uri.length > 0 && player && (
                <View style={styles.absoluteFill}>
                    <VideoView
                        player={player}
                        style={styles.video}
                        contentFit="cover"
                        nativeControls={false}
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
