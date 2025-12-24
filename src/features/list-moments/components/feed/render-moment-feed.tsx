import { View, useColorScheme } from "react-native"

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    interpolate,
    useAnimatedReaction,
    runOnJS,
    type SharedValue,
} from "react-native-reanimated"
import FeedContext from "../../../../contexts/Feed"
import { LanguagesCodesType } from "../../../../locales/LanguageTypes"
import { Moment } from "../../../../components/moment"
import { MomentProps } from "../../../../contexts/Feed/types"
import React from "react"
import RenderCommentFeed from "./render-comment-feed"
import { UserShow } from "../../../../components/user_show"
import fonts from "@/constants/fonts"
import sizes from "../../../../constants/sizes"
import { useKeyboard } from "../../../../lib/hooks/useKeyboard"
import ZeroComments from "../../../../components/comment/components/comments-zero_comments"
import { LinearGradient } from "expo-linear-gradient"

type renderMomentProps = {
    momentData: MomentProps
    isFocused: boolean
    isFeed: boolean
    focusProgress?: any // Opcional: pode ser AnimatedInterpolation do React Native ou SharedValue do Reanimated
    scrollXShared?: SharedValue<number> // SharedValue do scrollX para interpolação
    itemIndex?: number // Índice do item para calcular focusProgress
}

const BASE_OPACITY_OFF = 0.42
// Escala removida - agora é controlada 100% pela interpolação do scrollX no index.tsx

export default function RenderMomentFeed({
    momentData,
    isFocused,
    isFeed,
    focusProgress,
    scrollXShared,
    itemIndex,
}: renderMomentProps) {
    const { commentEnabled } = React.useContext(FeedContext)
    const isDarkMode = useColorScheme() === "dark"
    const { progress: keyboardProgress, height: keyboardHeight } = useKeyboard()

    const commentShared = useSharedValue(commentEnabled ? 1 : 0)

    React.useEffect(() => {
        commentShared.value = withTiming(commentEnabled ? 1 : 0, {
            duration: 250,
        })
    }, [commentEnabled, commentShared])

    const adaptedMomentData = {
        id: String(momentData.id),
        user: {
            ...momentData.user,
            id: String(momentData.user.id),
            youFollow: momentData.user.isFollowing ?? false,
        },
        description: momentData.description ?? "",
        midia: momentData.midia,
        comments: [],
        statistics: {
            total_likes_num: momentData.metrics.totalLikes ?? momentData.likes_count ?? 0,
            total_comments_num: momentData.metrics.totalComments ?? momentData.comments_count ?? 0,
            total_shares_num: 0,
            total_views_num: momentData.metrics.totalViews ?? 0,
        },
        tags: [],
        language: "pt" as LanguagesCodesType,
        created_at: momentData.created_at ?? momentData.publishedAt,
        is_liked: momentData.isLiked,
        media: momentData.media,
        thumbnail: momentData.thumbnail,
        duration: momentData.duration,
        size: momentData.size,
        hasAudio: momentData.hasAudio,
        ageRestriction: momentData.ageRestriction,
        contentWarning: momentData.contentWarning,
        metrics: momentData.metrics,
        publishedAt: momentData.publishedAt,
    }

    const dimmedOpacity = isDarkMode ? 0.2 : BASE_OPACITY_OFF

    // Converter focusProgress (AnimatedInterpolation) para SharedValue
    const focusProgressValue = useSharedValue(isFocused ? 1 : 0)

    // Sincronizar focusProgress do React Native Animated com Reanimated SharedValue
    useAnimatedReaction(
        () => {
            "worklet"
            if (scrollXShared && itemIndex !== undefined) {
                // Calcular diretamente do scrollX para máxima fluidez
                const margin = -3
                const itemFullWidth = sizes.moment.standart.width + margin + margin
                const centerOffset = (sizes.screens.width - sizes.moment.standart.width) / 2
                const focusPointX = sizes.screens.width - 200

                const itemScrollPosition = itemIndex === 0 ? 0 : itemIndex * itemFullWidth
                const itemCenterAtFocus =
                    itemScrollPosition +
                    sizes.moment.standart.width / 2 -
                    focusPointX +
                    (itemIndex === 0 ? centerOffset : 0)

                const inputRange = [
                    itemCenterAtFocus - itemFullWidth,
                    itemCenterAtFocus,
                    itemCenterAtFocus + itemFullWidth,
                ]

                // Interpolação fluida: [0, 1, 0] para escala e opacidade suaves
                return interpolate(scrollXShared.value, inputRange, [0, 1, 0], "clamp")
            }
            return isFocused ? 1 : 0
        },
        (result) => {
            "worklet"
            // Atualizar diretamente sem timing para máxima fluidez com o scroll
            focusProgressValue.value = result
        },
        [itemIndex, scrollXShared],
    )

    // Fallback: sincronizar com isFocused se scrollXShared não estiver disponível
    React.useEffect(() => {
        if (!scrollXShared || itemIndex === undefined) {
            focusProgressValue.value = withTiming(isFocused ? 1 : 0, {
                duration: 220,
            })
        }
    }, [scrollXShared, itemIndex, isFocused, focusProgressValue])

    // Animação do momento: ESCALA + OPACIDADE + TRANSLATEY
    const animatedMomentStyle = useAnimatedStyle(() => {
        "worklet"

        // Opacidade baseada no foco
        const baseOpacity = dimmedOpacity + (1 - dimmedOpacity) * focusProgressValue.value

        // Quando o input estiver ativo (commentEnabled), momentos não focados devem ter opacidade 0
        // Momentos focados mantêm a opacidade base reduzida quando comentários estão ativos
        let opacity = baseOpacity
        if (commentShared.value > 0) {
            // Se o momento está focado, reduzir opacidade um pouco
            // Se o momento não está focado, opacidade vai para 0
            opacity =
                focusProgressValue.value > 0.5 ? baseOpacity * (1 - 0.15 * commentShared.value) : 0
        }

        // Redução de escala quando comentários estão habilitados (só para momentos focados)
        // Aplicar apenas quando o momento está focado (focusProgressValue > 0.5)
        const commentScale = focusProgressValue.value > 0.5 ? 1 - 0.06 * commentShared.value : 1

        // Redução adicional de escala quando o teclado aparece (interpolação com progresso do teclado)
        // Aplicar apenas quando o momento está focado (focusProgressValue > 0.5)
        const keyboardScale =
            focusProgressValue.value > 0.5
                ? 1 - 0.65 * keyboardProgress.value * commentShared.value
                : 1

        // TranslateY quando teclado aparece (movendo para cima)
        // Aplicar apenas quando o momento está focado (focusProgressValue > 0.5)
        const translateY = focusProgressValue.value > 0.5 ? -160 * commentShared.value : 0

        // Escala final: apenas commentScale e keyboardScale
        // A escala base é 100% controlada pelo scrollX no index.tsx
        const finalScale = commentScale * keyboardScale

        return {
            opacity,
            transform: [{ translateY }, { scale: finalScale }],
        }
    }, [dimmedOpacity])

    // Animação dos comentários: APENAS OPACIDADE (SEM ESCALA E SEM TRANSLATEY)
    const animatedCommentStyle = useAnimatedStyle(() => {
        "worklet"

        // Opacidade: desaparecer quando input estiver ativo
        const opacity = commentShared.value > 0 ? 0 : 1

        return {
            opacity,
        }
    }, [])

    return (
        <Moment.Root.Main
            momentData={adaptedMomentData}
            isFeed={isFeed}
            isFocused={isFocused}
            momentSize={sizes.moment.standart}
        >
            {/* Momento com escala + opacidade + translateY */}
            <Animated.View style={animatedMomentStyle}>
                <Moment.Container
                    contentRender={momentData.midia}
                    isFocused={isFocused}
                    blurRadius={120}
                >
                    <Moment.Root.Top>
                        <Moment.Root.TopLeft>
                            <UserShow.Root data={adaptedMomentData.user}>
                                <UserShow.ProfilePicture
                                    pictureDimensions={{ width: 30, height: 30 }}
                                />
                                <UserShow.Username fontFamily={fonts.family["Bold-Italic"]} />
                            </UserShow.Root>
                        </Moment.Root.TopLeft>
                        <Moment.Root.TopRight>
                            <></>
                        </Moment.Root.TopRight>
                    </Moment.Root.Top>

                    <Moment.Root.Center>
                        <View
                            style={{ marginBottom: sizes.margins["2sm"], width: "100%", zIndex: 1 }}
                        >
                            <Moment.Description />
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={{ flex: 1 }}>
                                    <Moment.LikeButton isLiked={false} />
                                </View>
                                <View>
                                    <Moment.AudioControl />
                                </View>
                            </View>
                        </View>
                    </Moment.Root.Center>
                    <LinearGradient
                        colors={["rgba(0, 0, 0, 0.00)", "rgba(0, 0, 0, 0.4)"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: sizes.moment.standart.width,
                            height: sizes.moment.standart.height * 0.1,
                            zIndex: 0,
                        }}
                    />
                </Moment.Container>
            </Animated.View>

            {/* Comentários SEM escala, apenas opacidade (desaparecem quando input ativo) */}
            <Animated.View style={[animatedCommentStyle, { marginTop: 3 }]}>
                {momentData.topComment ? (
                    <RenderCommentFeed moment={momentData} focused={isFocused} />
                ) : (
                    <View style={{ alignSelf: "center", marginTop: sizes.margins["2sm"] }}>
                        <ZeroComments />
                    </View>
                )}
            </Animated.View>
        </Moment.Root.Main>
    )
}
