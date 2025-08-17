import React, { useEffect } from "react"
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated"

import ColorTheme from "../../../layout/constants/colors"
import DoubleTapPressable from "../../general/double-tap-pressable"
import FeedContext from "../../../contexts/Feed"
import MediaRenderVideo from "../../midia_render/components/midia_render-video"
import { MidiaRender } from "../../midia_render"
import { MomentContainerProps } from "../moment-types"
import MomentContext from "../context"
import MomentVideoSlider from "../components/moment-video-slider"
import PersistedContext from "@/contexts/Persisted"
import { UserShow } from "../../user_show"
import { View } from "react-native"
import { videoCacher } from "@/contexts/Feed/functions/video-cacher"

export default function Container({
    children,
    contentRender,
    isFocused = true,
}: MomentContainerProps) {
    const { momentData, momentUserActions, momentSize, momentOptions, momentVideo } =
        React.useContext(MomentContext)
    const { session } = React.useContext(PersistedContext)
    const { commentEnabled } = React.useContext(FeedContext)
    const [hasVideoCache, setHasVideoCache] = React.useState<boolean>(false)
    const [cachedVideoUri, setCachedVideoUri] = React.useState<string | undefined>()

    // Atualizar o estado de pausa do vídeo quando muda o foco
    useEffect(() => {
        if (momentData.midia.content_type === "VIDEO") {
            momentVideo.setIsPaused(!isFocused || commentEnabled)
        }
    }, [isFocused, commentEnabled, momentData.midia.content_type, momentVideo])

    const container: any = {
        ...momentSize,
        overflow: "hidden",
        backgroundColor: ColorTheme().backgroundDisabled,
    }
    const content_container: any = {
        flex: 1,
        position: "absolute",
        width: momentSize.width,
        height: momentSize.height,
        zIndex: 0,
    }

    const tiny_container: any = {
        width: momentSize.width * 0.31,
        height: momentSize.height * 0.31,
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
        zIndex: 10,
    }

    React.useEffect(() => {

        if(momentData.midia.content_type !== "VIDEO") return
        const url = momentData.midia.fullhd_resolution || momentData.midia.nhd_resolution

        if (!url) return

        videoCacher
            .preload({ id: Number(momentData.id), url })
            .then((localUri) => {
                setCachedVideoUri(localUri)
                setHasVideoCache(true)
            })
            .catch((err) => {
                console.warn("Erro ao obter vídeo cacheado:", err)
                setCachedVideoUri(url) // fallback se falhar
                setHasVideoCache(false)
            })
    }, [momentData.id, momentData.midia])

    async function handleDoublePress() {
        if (momentData.user.id != session.user.id) momentUserActions.handleLikeButtonPressed({})
    }
    
    function handleProgressChange(currentTime: number, duration: number) {
        momentVideo.setCurrentTime(currentTime)
        momentVideo.setDuration(duration)
    }

    const renderVideoContent = () => {
        // Agora sempre renderizamos o componente de vídeo, mas controlamos o estado através da prop isFocused
        return (
            <View style={{ width: momentSize.width, height: momentSize.height }}>
                <MediaRenderVideo 
                    uri={cachedVideoUri}
                    thumbnailUri={momentData.midia.nhd_thumbnail}
                    hasVideoCache={hasVideoCache}
                    autoPlay={!momentVideo.isPaused}
                    style={{
                        width: momentSize.width,
                        height: momentSize.height
                    }}
                    onVideoLoad={(duration) => {
                        console.log("Vídeo carregado com duração:", duration)
                        momentVideo.setDuration(duration)
                    }}
                    onVideoEnd={() => {
                        console.log("Vídeo terminou")
                    }}
                    onProgressChange={handleProgressChange}
                    isFocused={isFocused}
                />
            </View>
        )
    }

    /** 
    async function handleSinglePress() {
        if (!commentEnabled && momentOptions.isFeed) {
            if (!fromFullMomentScreen && isFocused) {
                momentUserActions.setClickIntoMoment(true)
                setFocusedMoment({
                    id: momentData.id,
                    user: momentData.user,
                    description: momentData.description,
                    midia: momentData.midia,
                    comments: momentData.comments,
                    statistics: momentData.statistics,
                    tags: momentData.tags,
                    language: momentData.language,
                    created_at: momentData.created_at,
                    is_liked: momentUserActions.liked,
                })
            }
            navigation.navigate("MomentNavigator", { screen: "DetailScreen" })
        }
    }
        
*/


    return (
        <View style={container}>
            <View style={content_container}>
                <DoubleTapPressable onDoubleTap={handleDoublePress}>
                    <MidiaRender.Root data={contentRender} content_sizes={momentSize}>
                        {momentData.midia.content_type === "VIDEO" ? (
                            renderVideoContent()
                        ) : (
                            <MidiaRender.RenderImage
                                isFeed={momentOptions.isFeed}
                                enableBlur={true}
                                blur={!isFocused}
                            />
                        )}
                    </MidiaRender.Root>
                </DoubleTapPressable>
            </View>
            
            {/* Controles de vídeo (áudio e slider) */}
            {momentData.midia.content_type === "VIDEO" && isFocused && !commentEnabled && (
                <>
                    <View style={sliderContainerStyle}>
                        <MomentVideoSlider 
                            width={momentSize.width * 0.90}
                            currentTime={momentVideo.currentTime}
                            duration={momentVideo.duration}
                        />
                    </View>
                </>
            )}
            
            {!commentEnabled ? (
                isFocused ? (
                    children
                ) : null
            ) : (
                <Reanimated.View
                    style={tiny_container}
                    entering={FadeIn.delay(300).duration(200)}
                    exiting={FadeOut.duration(100)}
                >
                    <UserShow.Root data={momentData.user}>
                        <View style={{ top: 1 }}>
                            <UserShow.ProfilePicture
                                pictureDimensions={{ width: 15, height: 15 }}
                            />
                        </View>
                        <UserShow.Username
                            scale={0.8}
                            margin={0}
                            truncatedSize={8}
                        />
                    </UserShow.Root>
                </Reanimated.View>
            )}
        </View>
    )
}
