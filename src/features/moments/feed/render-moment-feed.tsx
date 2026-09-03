import {
    View,
    useColorScheme,
    Keyboard,
    Animated as RNAnimated,
    Dimensions,
    Platform,
    StyleSheet,
} from "react-native"
import { BlurView } from "expo-blur"
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
import { INITIAL_PADDING, SNAP_INTERVAL } from "@/features/moments/feed-metrics"
import { useKeyboard } from "@/lib/hooks/useKeyboard"
import ZeroComments from "@/components/comment/components/comments-zero_comments"
import { LinearGradient } from "expo-linear-gradient"
import { ProfileDropDownMenuIOS } from "@/features/profile/profile.moments.dropdown.menu"

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
// Intensidade do blur aplicado nos momentos desfocados do feed.
const BLUR_INTENSITY = 40
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
    const bottomAnchorRef = React.useRef<View>(null)
    const bottomGapRef = React.useRef(0)

    // O input flutuante é `position: absolute` dentro da célula da FlatList
    // (Moment.Root.Main é só um Provider, não renderiza View), então `bottom`
    // é medido a partir da base do item — que fica bem acima da base da tela.
    // Sem descontar essa folga o input sobe `keyboardHeight + folga` e fica
    // solto acima do teclado. Medimos a âncora em coordenadas de janela para
    // que ele encoste no teclado em qualquer aparelho / altura de comentários.
    const measureBottomGap = React.useCallback((onMeasured?: (gap: number) => void) => {
        const anchor = bottomAnchorRef.current
        if (!anchor) {
            onMeasured?.(bottomGapRef.current)
            return
        }
        anchor.measureInWindow((_x, y) => {
            const gap = Dimensions.get("window").height - y
            if (Number.isFinite(gap) && gap >= 0) bottomGapRef.current = gap
            onMeasured?.(bottomGapRef.current)
        })
    }, [])

    React.useEffect(() => {
        const showListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => {
                const offset = Platform.OS === "ios" ? 0 : 20
                setShowFloatingInput(true)
                measureBottomGap((gap) => {
                    RNAnimated.timing(keyboardHeightAnim, {
                        toValue: Math.max(0, e.endCoordinates.height - offset - gap),
                        duration: Platform.OS === "ios" ? 250 : 200,
                        useNativeDriver: false,
                    }).start()
                })
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
    }, [measureBottomGap])

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
            // Pré-mede enquanto o item já está focado (escala 1), antes do
            // teclado subir, para o listener não depender do callback assíncrono.
            measureBottomGap()
        }
    }, [commentEnabled, isFocused, measureBottomGap])

    const dimmedOpacity = isDarkMode ? 0.2 : BASE_OPACITY_OFF
    const focusProgressValue = useSharedValue(isFocused ? 1 : 0)
    useAnimatedReaction(
        () => {
            "worklet"
            if (scrollXShared && itemIndex !== undefined) {
                // Calcular diretamente do scrollX para máxima fluidez.
                // O passo entre itens é o SNAP_INTERVAL do carrossel: usar
                // qualquer outro valor faz o erro acumular com o índice, e a
                // opacidade de foco descasa do item que está de fato centrado.
                const itemFullWidth = SNAP_INTERVAL
                const centerOffset = INITIAL_PADDING
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

    // Transform (escala + translateY) — no wrapper externo, para que o overlay
    // de blur também acompanhe o movimento/escala do momento.
    const momentTransformStyle = useAnimatedStyle(() => {
        "worklet"
        const focus = focusProgressValue.value
        // Progresso ÚNICO: subida do teclado em modo comentário, só no focado.
        const rise = commentShared.value * keyboardProgress.value * focus
        const MOVE_UP = 110 // px de subida com o teclado cheio
        const SCALE_SHRINK = 0.38 // encolhe até 0.62 com o teclado cheio
        return {
            transform: [{ translateY: -MOVE_UP * rise }, { scale: 1 - SCALE_SHRINK * rise }],
        }
    }, [])

    // Opacidade (dimming do desfocado) — na camada INTERNA (só o conteúdo do vídeo).
    // Em modo comentário os NÃO focados desaparecem por completo, e voltam ao
    // dimming normal quando o teclado desce e o card retoma a escala cheia —
    // as duas transições são dirigidas pelo mesmo `keyboardProgress`, então
    // acontecem em sincronia com a escala sem timing próprio.
    const momentDimStyle = useAnimatedStyle(() => {
        "worklet"
        const focus = focusProgressValue.value
        // Diferente do `rise`, este progresso NÃO é multiplicado pelo foco:
        // é justamente nos itens não focados que ele precisa agir.
        const commentProgress = commentShared.value * keyboardProgress.value
        const base = dimmedOpacity + (1 - dimmedOpacity) * focus
        // `(1 - focus)` isola o efeito nos não focados: no focado o fator é 1.
        return { opacity: base * (1 - commentProgress * (1 - focus)) }
    }, [dimmedOpacity])

    // Blur dos desfocados: overlay FORA da camada de opacidade (senão o dimming
    // enfraqueceria o blur). Opacidade 1 quando desfocado, 0 quando focado.
    // Some junto no modo comentário — senão sobraria um retângulo fosco no
    // lugar do momento que acabou de desaparecer.
    const momentBlurStyle = useAnimatedStyle(() => {
        "worklet"
        const commentProgress = commentShared.value * keyboardProgress.value
        return { opacity: (1 - focusProgressValue.value) * (1 - commentProgress) }
    }, [])

    return (
        <Moment.Root.Main
            data={{ ...data, isLiked: false }}
            isFeed={isFeed}
            isFocused={isFocused}
            size={sizes.moment.standart}
        >
            {/* Momento: transform (externo) → dim (interno) → conteúdo */}
            <Animated.View style={momentTransformStyle}>
                <Animated.View style={momentDimStyle}>
                    <ProfileDropDownMenuIOS>
                        <Moment.Container
                            contentRender={data.media}
                            isFocused={isFocused}
                            blurRadius={120}
                        >
                            <Moment.Root.Top>
                                <Moment.Root.TopLeft>
                                    <UserShow.Root data={data.user}>
                                        <UserShow.ProfilePicture
                                            pictureDimensions={{ width: 30, height: 30 }}
                                        />
                                        <UserShow.Username
                                            fontFamily={fonts.family["Bold-Italic"]}
                                        />
                                    </UserShow.Root>
                                </Moment.Root.TopLeft>
                                <Moment.Root.TopRight>
                                    <Moment.AudioControl size={32} />
                                </Moment.Root.TopRight>
                            </Moment.Root.Top>

                            <Moment.Root.Center></Moment.Root.Center>
                            <Moment.Root.Bottom>
                                <View
                                    style={{
                                        marginBottom: sizes.margins["2sm"],
                                        width: "100%",
                                        zIndex: 1,
                                    }}
                                >
                                    <View style={{ height: 46 }}>
                                        <Moment.LikeButtonIOS isLiked={false} />
                                    </View>
                                </View>
                            </Moment.Root.Bottom>
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
                    </ProfileDropDownMenuIOS>
                </Animated.View>

                {/* Blur nos momentos desfocados — fora do dim para não enfraquecer */}
                <Animated.View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            borderRadius: sizes.moment.standart.borderRadius,
                            overflow: "hidden",
                        },
                        momentBlurStyle,
                    ]}
                >
                    <BlurView
                        intensity={BLUR_INTENSITY}
                        tint="dark"
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
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

            {/* Âncora da base do item: referência para alinhar o input ao teclado */}
            <View ref={bottomAnchorRef} collapsable={false} pointerEvents="none" />

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
