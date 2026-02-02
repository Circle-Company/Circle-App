import { View, useColorScheme, Keyboard, Animated as RNAnimated, Platform } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    useAnimatedReaction,
    type SharedValue,
} from "react-native-reanimated"
import Input from "@/components/comment/components/comments-input"
import FeedContext from "@/contexts/Feed"
import { Moment } from "@/components/moment"
import { Moment as MomentProps } from "@/contexts/Feed/types"
import React from "react"
import RenderCommentFeed from "./render-comment-feed"
import { UserShow } from "@/components/user_show"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { useKeyboard } from "@/lib/hooks/useKeyboard"
import ZeroComments from "@/components/comment/components/comments-zero_comments"
import { LinearGradient } from "expo-linear-gradient"
import { isIOS, iOSMajorVersion } from "@/lib/platform/detection"

type renderMomentProps = {
    data: MomentProps
    isFocused: boolean
    isFeed: boolean
    isMe: boolean
    focusProgress?: any // Opcional: pode ser AnimatedInterpolation do React Native ou SharedValue do Reanimated
    scrollXShared?: SharedValue<number> // SharedValue do scrollX para interpolação
    itemIndex?: number // Índice do item para calcular focusProgress
}

const BASE_OPACITY_OFF = 0.42
// Escala removida - agora é controlada 100% pela interpolação do scrollX no index.tsx

export default function RenderMomentFeed({
    data,
    isFocused,
    isFeed,
    isMe,
    focusProgress,
    scrollXShared,
    itemIndex,
}: renderMomentProps) {
    const isDarkMode = useColorScheme() === "dark"
    const { progress: keyboardProgress } = useKeyboard()
    const { commentEnabled } = React.useContext(FeedContext)
    const commentShared = useSharedValue(commentEnabled ? 1 : 0)
    const keyboardHeightAnim = React.useRef(new RNAnimated.Value(0)).current
    const [showFloatingInput, setShowFloatingInput] = React.useState(false)

    React.useEffect(() => {
        const showListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => {
                const offset = Platform.OS === "ios" ? 0 : 20
                setShowFloatingInput(true)
                RNAnimated.timing(keyboardHeightAnim, {
                    toValue: e.endCoordinates.height - offset,
                    duration: Platform.OS === "ios" ? 250 : 200,
                    useNativeDriver: false,
                }).start()
            },
        )
        const hideListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                RNAnimated.timing(keyboardHeightAnim, {
                    toValue: 0,
                    duration: Platform.OS === "ios" ? 250 : 200,
                    useNativeDriver: false,
                }).start(() => {
                    setShowFloatingInput(false)
                })
            },
        )

        return () => {
            showListener.remove()
            hideListener.remove()
        }
    }, [])

    React.useEffect(() => {
        commentShared.value = withTiming(commentEnabled ? 1 : 0, {
            duration: 250,
        })
        // Hide floating input immediately when comments are disabled
        if (!commentEnabled) {
            setShowFloatingInput(false)
            RNAnimated.timing(keyboardHeightAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: false,
            }).start()
        }
    }, [commentEnabled, commentShared])

    React.useEffect(() => {
        if (commentEnabled && isFocused) {
            setShowFloatingInput(true)
        }
    }, [commentEnabled, isFocused])

    const dimmedOpacity = isDarkMode ? 0.2 : BASE_OPACITY_OFF
    const focusProgressValue = useSharedValue(isFocused ? 1 : 0)
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
                return interpolate(scrollXShared.value, inputRange, [0, 1, 0], "clamp")
            }
            return isFocused ? 1 : 0
        },
        (result) => {
            "worklet"
            focusProgressValue.value = result
        },
        [itemIndex, scrollXShared],
    )

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

        // Redução de escala quando comentários estão habilitados (só para momentos focados)
        // Aplicar apenas quando o momento está focado (focusProgressValue > 0.5)
        const commentScale = focusProgressValue.value > 0.5 ? 1 - 0.06 * commentShared.value : 1

        // Redução adicional de escala quando o teclado aparece (interpolação com progresso do teclado)
        // Aplicar apenas quando o momento está focado (focusProgressValue > 0.5)
        const keyboardScale =
            focusProgressValue.value > 0.5
                ? 1 - 0.3 * keyboardProgress.value * commentShared.value
                : 1

        // Escala final: apenas commentScale e keyboardScale
        // A escala base é 100% controlada pelo scrollX no index.tsx
        const finalScale = commentScale * keyboardScale

        // Elevação leve do momento quando teclado/comentários ativos
        const translateY =
            focusProgressValue.value > 0.5 ? -100 * keyboardProgress.value * commentShared.value : 0

        return {
            opacity: baseOpacity,
            transform: [{ translateY }, { scale: finalScale }],
        }
    }, [dimmedOpacity])

    return (
        <Moment.Root.Main
            data={{ ...data, isLiked: false }}
            isFeed={isFeed}
            isFocused={isFocused}
            size={sizes.moment.standart}
        >
            {/* Momento com escala + opacidade + translateY */}
            <Animated.View style={animatedMomentStyle}>
                <Moment.Container contentRender={data.media} isFocused={isFocused} blurRadius={120}>
                    <Moment.Root.Top>
                        <Moment.Root.TopLeft>
                            <UserShow.Root data={data.user}>
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
                            {!isMe && (
                                <View style={{ marginLeft: 6, marginBottom: 10 }}>
                                    <Moment.Description />
                                </View>
                            )}
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={{ flex: 1, height: 46 }}>
                                    {isIOS ? (
                                        <>
                                            <Moment.LikeButtonIOS isLiked={false} />
                                        </>
                                    ) : (
                                        <Moment.LikeButton isLiked={false} />
                                    )}
                                    {isMe && <Moment.Description />}
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
            <Animated.View style={{ marginTop: 3 }}>
                {data.topComment || data.metrics.totalComments > 1 ? (
                    <RenderCommentFeed moment={data} focused={isFocused} />
                ) : (
                    <View style={{ alignSelf: "center", marginTop: sizes.margins["2sm"] }}>
                        <ZeroComments isAccount={false} moment={data} />
                    </View>
                )}
            </Animated.View>

            {/* Input flutuante: mostrar enquanto teclado visível/animando e foco no momento */}
            {isFocused && showFloatingInput && (
                <RNAnimated.View
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: keyboardHeightAnim,
                        zIndex: 9999,
                    }}
                >
                    <Input
                        momentId={data.id}
                        onSent={() => {
                            setShowFloatingInput(false)
                        }}
                        autoFocus={commentEnabled}
                    />
                </RNAnimated.View>
            )}
        </Moment.Root.Main>
    )
}
