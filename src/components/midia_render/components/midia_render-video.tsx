import { Animated, Image, StyleSheet, View } from "react-native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import Video, { OnLoadData, OnProgressData } from "react-native-video"

import MidiaRenderVideoError from "./midia_render-video_error"
import MomentContext from "@/components/moment/context"
import PersistedContext from "@/contexts/Persisted"
import { t } from "i18next"

interface VideoPlayerProps {
    uri?: string;
    thumbnailUri?: string;
    autoPlay?: boolean;
    onVideoLoad?: (duration: number) => void;
    onVideoEnd?: () => void;
    onProgressChange?: (currentTime: number, duration: number) => void;
    style?: Record<string, unknown>;
    showControls?: boolean;
    blurRadius?: number;
    isFocused?: boolean;
    width?: number;
    height?: number;
}

export default function MediaRenderVideo({
    uri,
    thumbnailUri,
    autoPlay = true,
    onVideoLoad,
    onVideoEnd,
    onProgressChange,
    blurRadius = 10,
    isFocused = true,
    width,
    height
}: VideoPlayerProps) {

    const { momentSize } = React.useContext(MomentContext)
    // Se momentSize não existir, usa width/height das props
    const videoWidth = momentSize?.width ?? width ?? 200
    const videoHeight = momentSize?.height ?? height ?? 200
    
    // Estados
    const [isPlaying, setIsPlaying] = useState(autoPlay && isFocused)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [fadeAnim] = useState(new Animated.Value(1))
    const [videoLoaded, setVideoLoaded] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const videoRef = useRef<Video>(null)
    const retryCount = useRef(0)
    const maxRetries = 2
    
    // Usar a thumbnail ou a própria URL do vídeo como fallback para a thumbnail
    const thumbnailSource = thumbnailUri || uri
    
    // Usar apenas o estado global do MomentContext
    const {session} = React.useContext(PersistedContext)
    const isMuted = session?.preferences?.content?.muteAudio || false
    
    // Declarações de funções auxiliares como useCallback para evitar problemas de dependências
    const fadeOutThumbnail = useCallback(() => {
        // Só faz fade da thumbnail se estiver focado
        if (isFocused) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 600, // Tempo da transição (em milissegundos)
                useNativeDriver: true, // Usa o driver nativo para melhor performance
            }).start()
        }
    }, [fadeAnim, isFocused])
    
    const resetVideoPosition = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.seek(0)
        }
    }, [])
    
    // Monitorar mudanças no estado de foco
    useEffect(() => {
        if (isFocused) {
            // Quando volta ao foco, reinicia o vídeo do zero e faz o fade da thumbnail
            if (videoLoaded) {
                resetVideoPosition()
                setIsPlaying(true)
                fadeOutThumbnail()
            }
        } else {
            // Quando perde o foco, pausa o vídeo e mostra a thumbnail imediatamente
            setIsPlaying(false)
            
            // Garante que a thumbnail seja exibida imediatamente
            fadeAnim.setValue(1)
            
            // Para completamente o vídeo quando não está em foco
            if (videoRef.current) {
                videoRef.current.seek(0)
            }
        }
    }, [isFocused, videoLoaded, resetVideoPosition, fadeOutThumbnail, fadeAnim])
    
    // Efeito para notificar sobre mudanças no progresso
    useEffect(() => {
        if (onProgressChange && !isLoading && isFocused) {
            onProgressChange(currentTime, duration)
        }
    }, [currentTime, duration, onProgressChange, isLoading, isFocused])

    // Tentar reproduzir novamente após um erro
    const retryPlayback = useCallback(() => {
        if (retryCount.current < maxRetries) {
            console.log(`Tentando reproduzir o vídeo novamente. Tentativa ${retryCount.current + 1} de ${maxRetries}`)
            retryCount.current += 1
            setHasError(false)
            setIsLoading(true)
            
            // Pequeno atraso antes de tentar novamente
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.seek(0)
                    setIsPlaying(true)
                }
            }, 1000)
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
        errorThumbnail: {
            ...StyleSheet.absoluteFillObject,
            zIndex: 3,
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
        thumbnailContainer: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "transparent",
            zIndex: isFocused ? 3 : 10, // Aumenta o zIndex quando não está focado
        },
        video: {
            backgroundColor: "transparent",
            height: "100%",
            width: "100%",
        }
    })

    // Handlers
    function handleLoad(data: OnLoadData) {
        console.log("Video loaded successfully", data)
        setIsLoading(false)
        setVideoLoaded(true)
        setDuration(data.duration)
        
        // Reset retry counter on successful load
        retryCount.current = 0
        
        // Só faz o fade da thumbnail se estiver em foco
        if (isFocused) {
            fadeOutThumbnail()
        }
        
        if (onVideoLoad) {
            onVideoLoad(data.duration)
        }
    }

    function handleProgress(data: OnProgressData) {
        // Só atualiza o progresso se estiver em foco
        if (isFocused) {
            setCurrentTime(data.currentTime)
        }
    }

    function handleError(error: unknown) {
        console.error("Video error:", error)
        
        // Mensagem de erro mais específica
        let errorMsg = t("Erro ao carregar o vídeo")
        
        if (error && typeof error === "object" && "error" in error) {
            const videoError = error as { error: { extra: number, what: number } }
            
            // Erros específicos baseados nos códigos
            if (videoError.error.extra === -1005) {
                errorMsg = t("Não foi possível acessar o vídeo. Verifique sua conexão.")
            }
        }
        
        setErrorMessage(errorMsg)
        setHasError(true)
        setIsLoading(false)
        
        // Tentar novamente automaticamente se não excedeu o limite
        if (retryCount.current < maxRetries) {
            retryPlayback()
        }
    }

    function handleEnd() {
        console.log("Video playback ended")
        setIsPlaying(false)
        if (onVideoEnd) {
            onVideoEnd()
        }
    }

    // Renderização
    if (hasError) {
        if(isFocused) { 
            return (
                <View style={styles.container}>
                    <Animated.View 
                        style={styles.errorThumbnail}
                    >
                        <Image
                            source={{ uri: thumbnailSource }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                            blurRadius={blurRadius}
                        />
                    </Animated.View>
                    <MidiaRenderVideoError 
                        message={errorMessage} 
                        onRetry={retryCount.current < maxRetries ? retryPlayback : undefined}
                    />
                </View>
            )
        } else {
            // Quando não está focado, mostra apenas a thumbnail sem mensagem de erro
            return (
                <View style={styles.container}>
                    <Image
                        source={{ uri: thumbnailSource }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                        blurRadius={blurRadius * 0.6}
                    />
                </View>
            )
        }
    }

    return (
        <View style={styles.container}>
            {/* Vídeo - só renderiza quando está em foco para economizar recursos */}
            {isFocused && (
                <Video
                    ref={videoRef}
                    source={{ uri: uri || "" }}
                    style={styles.video}
                    resizeMode="cover"
                    repeat={true}
                    paused={!isPlaying}
                    muted={isMuted}
                    controls={false}
                    onLoad={handleLoad}
                    onProgress={handleProgress}
                    onEnd={handleEnd}
                    onError={handleError}
                    ignoreSilentSwitch="ignore"
                    playInBackground={false}
                />
            )}
            
            {/* Thumbnail com efeito de fade - sempre presente, opacidade controlada */}
            <Animated.View 
                style={[
                    styles.thumbnailContainer, 
                    { opacity: isFocused ? fadeAnim : 1 }
                ]}
            >
                <Image
                    source={{ uri: thumbnailSource }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                    blurRadius={isFocused ? blurRadius : blurRadius * 0.6}
                />
            </Animated.View>
        </View>
    )
}


