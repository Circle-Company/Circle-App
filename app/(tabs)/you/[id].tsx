import React, { useCallback } from "react"
import { Animated as RNAnimated, Keyboard, Platform, Pressable, View } from "react-native"
import { Link, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import sizes from "@/constants/sizes"
import FeedContext from "@/contexts/Feed"
import PersistedContext from "@/contexts/Persisted"
import { Moment } from "@/components/moment"
import Input from "@/components/comment/components/comments-profile-input"
import {
    MomentAuthorHeader,
    MomentBottomGradient,
    MomentComments,
    MomentUnavailable,
    useMomentDetail,
} from "@/features/moments/detail"

const CARD = sizes.moment.standart

export default function MomentFullScreen() {
    const { id } = useLocalSearchParams<{ id: string; from?: string }>()
    const { session } = React.useContext(PersistedContext)
    const { commentEnabled, setCommentEnabled } = React.useContext(FeedContext)

    const navigation = useNavigation()

    // Snowflake: trafega como string de ponta a ponta, nunca `Number()`.
    const momentId = String(id ?? "")

    /**
     * Os momentos persistidos da conta são a semente **síncrona**, e é isso que faz a
     * transição de zoom funcionar: o `Link.AppleZoomTarget` precisa ter um filho montado,
     * com a geometria final, no instante em que a animação começa.
     *
     * A versão anterior desta tela buscava o momento num `useEffect` e renderizava `null`
     * até a resposta chegar — no primeiro frame não havia alvo nenhum, então a animação
     * partia de lugar nenhum e o card só aparecia depois dela, já com o player recomeçando
     * do zero. Como o autor é sempre o dono da sessão, ele vem de `session.account`.
     */
    const { momentData, isUnavailable, errorMessage } = useMomentDetail({
        momentId,
        sources: [session.account.moments],
        userFallback: session.account,
    })

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

    const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false)
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

    const animatedMomentStyle = useAnimatedStyle(() => {
        "worklet"
        const commentScale = 1 - 0.06 * commentShared.value
        const keyboardScale = 1 - 0.3 * keyboardProgress.value * commentShared.value
        const finalScale = commentScale * keyboardScale
        const translateY = -100 * keyboardProgress.value * commentShared.value
        return { transform: [{ translateY }, { scale: finalScale }] }
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
            <View style={{ height: sizes.headers.height * 0.7 }} />
            {momentData && !isUnavailable ? (
                <Moment.Root.Main
                    size={CARD}
                    isFeed={false}
                    isFocused={true}
                    data={momentData}
                    shadow={{ top: false, bottom: true }}
                >
                    {/*
                        A escala do teclado/comentário fica FORA do alvo de zoom.
                        O `Link.AppleZoomTarget` mede o retângulo do seu único filho nativo:
                        com um `Animated.View` transformado no meio, o que ele mede é o card
                        já deformado, e a animação aterrissa fora do lugar.
                    */}
                    <Animated.View collapsable={false} style={animatedMomentStyle}>
                        <Link.AppleZoomTarget>
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
                                <MomentAuthorHeader user={momentData.user} />

                                <Moment.Root.Center />

                                <Moment.Root.Bottom />

                                <MomentBottomGradient />
                            </Moment.Container>
                        </Link.AppleZoomTarget>
                    </Animated.View>
                    <MomentComments moment={momentData} isAccount={true} />
                </Moment.Root.Main>
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
                        autoFocus={true}
                        onSent={() => setCommentEnabled(false)}
                    />
                </RNAnimated.View>
            )}
        </SafeAreaView>
    )
}
