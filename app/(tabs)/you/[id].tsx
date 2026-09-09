import React, { useCallback } from "react"
import {
    View,
    Keyboard,
    Platform,
    Animated as RNAnimated,
    Pressable,
    StyleSheet,
} from "react-native"
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { Link, useLocalSearchParams, useNavigation, useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import PersistedContext from "@/contexts/Persisted"
import { Moment } from "@/components/moment"
import sizes from "@/constants/sizes"
import { UserShow } from "@/components/user_show"
import { LinearGradient } from "expo-linear-gradient"
import fonts from "@/constants/fonts"
import Input from "@/components/comment/components/comments-profile-input"
import FeedContext from "@/contexts/Feed"
import { MomentComments, MomentUnavailable, useMomentDetail } from "@/features/moments/detail"
import RenderViewersFeed from "@/features/moments/feed/render-viewers-feed"
import { useViewersPanel, viewersMomentTransform } from "@/features/moments/viewers/useViewersPanel"

// `transformOrigin` fica no estilo estático: é constante, e o worklet só devolve
// o transform. Sem a origem à esquerda o bloco escaparia do canto do card.
const userShowLayout = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    transformOrigin: "left center",
}

export default function MomentFullScreen() {
    const { id } = useLocalSearchParams<{ id: string; from?: string }>()
    const { session } = React.useContext(PersistedContext)
    const { commentEnabled, setCommentEnabled } = React.useContext(FeedContext)
    const {
        shouldRender: viewersOpen,
        openProgress: viewersProgress,
        scrollY: viewersScrollY,
        close: closeViewers,
    } = useViewersPanel(String(id))

    // Snowflake: trafega como string de ponta a ponta, nunca `Number()`.
    const momentId = String(id ?? "")

    /**
     * Os momentos persistidos da conta são a semente **síncrona**, e é isso que faz a
     * transição de zoom funcionar: o `Link.AppleZoomTarget` precisa ter um filho montado,
     * com a geometria final, no instante em que a animação começa.
     *
     * A versão anterior buscava o momento num `useEffect` e renderizava `null` até a
     * resposta chegar — no primeiro frame não havia alvo nenhum, então a animação partia de
     * lugar nenhum e o card só aparecia depois dela, com o player recomeçando do zero.
     */
    const { momentData, isUnavailable, errorMessage } = useMomentDetail({
        momentId,
        sources: [session.account.moments],
        userFallback: session.account,
    })
    // Comments UI and keyboard handling

    const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false)
    const navigation = useNavigation()
    useFocusEffect(
        useCallback(() => {
            const parent = navigation.getParent?.()
            if (parent) {
                parent.setOptions({
                    tabBarStyle: { display: "none", height: 0 },
                } as any)
            }
            return () => {
                if (parent) {
                    parent.setOptions({
                        tabBarStyle: undefined,
                    } as any)
                }
            }
        }, [navigation]),
    )
    const keyboardHeightAnim = React.useRef(new RNAnimated.Value(0)).current
    const keyboardProgress = useSharedValue(0)
    const commentShared = useSharedValue(commentEnabled ? 1 : 0)

    React.useEffect(() => {
        const showListener = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => {
                const offset = Platform.OS === "ios" ? 0 : 20
                RNAnimated.timing(keyboardHeightAnim, {
                    toValue: e.endCoordinates.height - offset,
                    duration: Platform.OS === "ios" ? 250 : 200,
                    useNativeDriver: false,
                }).start()
                setIsKeyboardVisible(true)
                keyboardProgress.value = withTiming(1, {
                    duration: Platform.OS === "ios" ? 250 : 200,
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
                }).start()
                setIsKeyboardVisible(false)
                keyboardProgress.value = withTiming(0, {
                    duration: Platform.OS === "ios" ? 250 : 200,
                })
            },
        )

        return () => {
            showListener.remove()
            hideListener.remove()
        }
    }, [])

    React.useEffect(() => {
        commentShared.value = withTiming(commentEnabled ? 1 : 0, { duration: 250 })
    }, [commentEnabled, commentShared])

    // Um único cálculo de "quanto o card encolheu/subiu", lido pelo transform
    // do card, pela contra-escala do UserShow e pelo fade do Bottom.
    const momentShrink = useDerivedValue(() => {
        "worklet"
        const commentScale = 1 - 0.06 * commentShared.value
        const keyboardScale = 1 - 0.3 * keyboardProgress.value * commentShared.value
        // Mesma gramática do comentário: o painel de visualizadores encolhe e
        // sobe o card, e o scroll da lista continua interpolando até o limite.
        const viewers = viewersMomentTransform(viewersProgress.value, viewersScrollY.value)
        return {
            rise: Math.max(keyboardProgress.value * commentShared.value, viewers.rise),
            scale: commentScale * keyboardScale * viewers.scale,
            translateY: -100 * keyboardProgress.value * commentShared.value + viewers.translateY,
        }
    }, [])

    const animatedMomentStyle = useAnimatedStyle(() => {
        "worklet"
        const { scale, translateY } = momentShrink.value
        return {
            transform: [{ translateY }, { scaleX: scale }, { scaleY: scale }],
        }
    }, [])

    // O bloco do usuário não acompanha o encolhimento: a contra-escala desfaz
    // exatamente o que o card aplicou, mantendo-o no tamanho original e colado
    // no canto esquerdo.
    const userShowCounterScaleStyle = useAnimatedStyle(() => {
        "worklet"
        const inverse = 1 / momentShrink.value.scale
        return { transform: [{ scaleX: inverse }, { scaleY: inverse }] }
    }, [])

    // Tudo dentro do Bottom some junto com o encolhimento.
    const momentBottomFadeStyle = useAnimatedStyle(() => {
        "worklet"
        return { opacity: 1 - momentShrink.value.rise }
    }, [])

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#000",
                justifyContent: "flex-start",
                alignItems: "center",
            }}
        >
            <View
                style={{
                    height: sizes.headers.height * 0.7,
                }}
            />
            {momentData && !isUnavailable ? (
                <>
                    <Moment.Root.Main
                        size={sizes.moment.standart}
                        isFeed={false}
                        isFocused={true}
                        data={momentData}
                        shadow={{ top: false, bottom: true }}
                    >
                        {/* O AppleZoomTarget monta apenas UM filho nativo; por isso ele
                            envolve somente o card do vídeo — os comentários ficam fora. */}
                        <Link.AppleZoomTarget>
                            <Animated.View collapsable={false} style={animatedMomentStyle}>
                                <Moment.Container
                                    contentRender={momentData.media}
                                    isFocused={true}
                                    loading={false}
                                    blurRadius={30}
                                    forceMute={false}
                                    showSlider={true}
                                    disableCache={false}
                                    disableWatch={true}
                                >
                                    {/* Top user info (no scale animations) */}
                                    <Moment.Root.Top>
                                        <Moment.Root.TopLeft>
                                            <Animated.View
                                                style={[userShowLayout, userShowCounterScaleStyle]}
                                            >
                                                <UserShow.Root data={momentData.user}>
                                                    <UserShow.ProfilePicture
                                                        disableAction={true}
                                                        displayOnMoment={true}
                                                        pictureDimensions={{
                                                            width: 30,
                                                            height: 30,
                                                        }}
                                                    />
                                                    <UserShow.Username
                                                        pressable={false}
                                                        fontFamily={fonts.family["Bold-Italic"]}
                                                    />
                                                </UserShow.Root>
                                            </Animated.View>
                                        </Moment.Root.TopLeft>
                                        <Moment.Root.TopRight>
                                            <Moment.AudioControl size={36} />
                                        </Moment.Root.TopRight>
                                    </Moment.Root.Top>

                                    <Moment.Root.Center />

                                    <Moment.Root.Bottom>
                                        {/* Mesma linha do like nos outros
                                            moments; aqui só o botão do dono. */}
                                        <Animated.View
                                            pointerEvents={viewersOpen ? "none" : "auto"}
                                            style={[
                                                {
                                                    height: 46,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: sizes.margins["2sm"],
                                                    marginBottom: sizes.margins["2sm"],
                                                },
                                                momentBottomFadeStyle,
                                            ]}
                                        >
                                            <Moment.ViewersButtonIOS />
                                        </Animated.View>
                                    </Moment.Root.Bottom>

                                    {/* Subtle bottom gradient like feed */}
                                    <LinearGradient
                                        colors={["rgba(0, 0, 0, 0.00)", "rgba(0, 0, 0, 0.4)"]}
                                        start={{ x: 0.5, y: 0 }}
                                        end={{ x: 0.5, y: 1 }}
                                        style={{
                                            pointerEvents: "none",
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

                                {/* Com o painel aberto, tocar no moment é o que
                                    fecha — a camada só existe nesse estado. */}
                                {viewersOpen ? (
                                    <Pressable
                                        onPress={closeViewers}
                                        accessibilityRole="button"
                                        accessibilityLabel="Close viewers"
                                        style={StyleSheet.absoluteFill}
                                    />
                                ) : null}
                            </Animated.View>
                        </Link.AppleZoomTarget>
                        {viewersOpen ? (
                            <RenderViewersFeed
                                momentId={String(id)}
                                focused={true}
                                openProgress={viewersProgress}
                                scrollY={viewersScrollY}
                            />
                        ) : (
                            <MomentComments moment={momentData} isAccount={true} />
                        )}
                    </Moment.Root.Main>
                </>
            ) : (
                <MomentUnavailable message={errorMessage} />
            )}
            {/* Dismiss overlay when input is active and keyboard visible */}
            {commentEnabled && isKeyboardVisible && (
                <Pressable
                    onPress={() => {
                        setCommentEnabled(false)
                        Keyboard.dismiss()
                    }}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9998,
                    }}
                />
            )}
            {/* Input flutuante: mostrar quando commentEnabled estiver ativo */}
            {commentEnabled && (
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
                        momentId={momentId}
                        onSent={() => {
                            setCommentEnabled(false)
                        }}
                        autoFocus={true}
                    />
                </RNAnimated.View>
            )}
        </SafeAreaView>
    )
}
