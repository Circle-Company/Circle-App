import React, { useCallback } from "react"
import { Animated as RNAnimated, Keyboard, Platform, Pressable, View } from "react-native"
import { Link, Stack, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useQueryClient } from "@tanstack/react-query"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import FeedContext from "@/contexts/Feed"
import LanguageContext from "@/contexts/language"
import ProfileContext from "@/contexts/profile"
import { Moment } from "@/components/moment"
import Input from "@/components/comment/components/comments-profile-input"
import { ProfileDropDownMenuIOS } from "@/features/profile/profile.moments.dropdown.menu"
import {
    MomentAuthorHeader,
    MomentBottomGradient,
    MomentComments,
    MomentUnavailable,
    useMomentDetail,
} from "@/features/moments/detail"
import { momentKeys } from "@/queries/moment.get"

const CARD = sizes.moment.standart

export default function MomentFullScreen() {
    const { momentId: rawMomentId } = useLocalSearchParams<{ momentId: string }>()
    const { t } = React.useContext(LanguageContext)
    const { profile, moments } = React.useContext(ProfileContext)
    const { commentEnabled, setCommentEnabled } = React.useContext(FeedContext)

    const navigation = useNavigation()
    const queryClient = useQueryClient()

    // Snowflake: trafega como string de ponta a ponta, nunca `Number()`.
    const momentId = String(rawMomentId ?? "")

    // Esta tela só é alcançada de dentro de um perfil: a grade dele é a semente, e o próprio
    // perfil é o autor quando o item da lista não o traz (§2.1 do contrato).
    const { momentData, isUnavailable, errorMessage } = useMomentDetail({
        momentId,
        sources: [moments],
        userFallback: profile,
    })

    /**
     * Refetch ao ganhar foco: as métricas mudam enquanto o usuário está em outra tela (um
     * like dele mesmo, um comentário novo). Vai pelo `queryClient` em vez de um fetch
     * próprio — assim compartilha deduplicação, cancelamento e a classificação de erro do
     * `useMomentDetail`, em vez de reimplementar os três.
     */
    useFocusEffect(
        useCallback(() => {
            if (momentId) {
                queryClient.invalidateQueries({ queryKey: momentKeys.detail(momentId) })
            }
        }, [momentId, queryClient]),
    )

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
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: "Moment",
                    headerTitleAlign: "center",
                    headerLargeTitle: false,
                    headerLargeTitleShadowVisible: false,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: "transparent" },
                    headerTintColor: colors.gray.white,
                    headerTitleStyle: { fontFamily: fonts.family["Black-Italic"] },
                    headerBackTitle: t("Back"),
                }}
            />
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
                            O `AppleZoomTarget` monta apenas UM filho nativo e mede o
                            retângulo dele quando a transição começa — por isso ele envolve
                            somente o card do vídeo, e nada mais.

                            A escala do teclado (`Animated.View`) e o menu de contexto
                            (`ProfileDropDownMenuIOS`) ficam FORA: dentro, o que o iOS mede é
                            o card já deformado pela transformada e reparentado pelo host
                            SwiftUI do menu, e a animação aterrissa fora do lugar. É a mesma
                            ordem que a grade do perfil usa do lado de origem, onde o menu
                            envolve o `Link`, não o `AppleZoom`.
                        */}
                        <Animated.View collapsable={false} style={animatedMomentStyle}>
                            <ProfileDropDownMenuIOS>
                                <Link.AppleZoomTarget>
                                    <Moment.Container
                                        contentRender={momentData.media}
                                        isFocused={true}
                                        loading={false}
                                        blurRadius={30}
                                        forceMute={false}
                                        showSlider={true}
                                        disableCache={false}
                                        disableWatch={false}
                                    >
                                        <MomentAuthorHeader user={momentData.user} />

                                        <Moment.Root.Center>
                                            <View
                                                style={{
                                                    marginBottom: sizes.margins["2sm"],
                                                    width: "100%",
                                                    zIndex: 1,
                                                }}
                                            >
                                                <View style={{ height: 46 }}>
                                                    <Moment.LikeButtonIOS
                                                        isLiked={Boolean(momentData.isLiked)}
                                                    />
                                                </View>
                                            </View>
                                        </Moment.Root.Center>

                                        <MomentBottomGradient />
                                    </Moment.Container>
                                </Link.AppleZoomTarget>
                            </ProfileDropDownMenuIOS>
                        </Animated.View>
                        <MomentComments moment={momentData} />
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
        </>
    )
}
