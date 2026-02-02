import React, { useEffect, useCallback } from "react"
import { useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { View, Keyboard, Platform, Animated as RNAnimated, Pressable } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import PersistedContext from "@/contexts/Persisted"
import { UserShow } from "@/components/user_show"
import ProfileContext from "@/contexts/profile"
import { Moment } from "@/components/moment"
import FeedContext from "@/contexts/Feed"
import sizes from "@/constants/sizes"
import fonts from "@/constants/fonts"

import api from "@/api"
import Input from "@/components/comment/components/comments-profile-input"
import RenderCommentFeed from "@/features/moments/feed/render-comment-feed"
import ZeroComments from "@/components/comment/components/comments-zero_comments"
import useRewriteUrl from "@/lib/hooks/useRewriteUrl"
import { useToast } from "@/contexts/Toast"
import LanguageContext from "@/contexts/language"

export default function MomentFullScreen() {
    const { momentId } = useLocalSearchParams<{ momentId: string }>()
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { profile, moments } = React.useContext(ProfileContext)
    const { commentEnabled, setCommentEnabled } = React.useContext(FeedContext)

    const toast = useToast()
    const [remoteMoment, setRemoteMoment] = React.useState<any | null>(null)

    // Fetch a single moment by id (GET /moments/:id) with Authorization
    useEffect(() => {
        let cancelled = false
        async function fetchMoment() {
            try {
                const token = session?.account?.jwtToken
                const auth = token?.startsWith("Bearer ") ? token : token ? `Bearer ${token}` : ""
                const res = await api.get(
                    `/moments/${momentId}`,
                    auth ? { headers: { Authorization: auth } } : undefined,
                )
                if (!cancelled) {
                    const payload = (res as any)?.data?.moment ?? (res as any)?.data ?? null
                    setRemoteMoment(payload)
                }
            } catch (e) {
                toast.error(t("Fail to share your moment"))
                console.log("Moment fetch error:", e)
            }
        }
        if (momentId) fetchMoment()
        return () => {
            cancelled = true
        }
    }, [momentId, session?.account?.jwtToken])

    // Comments UI and keyboard handling

    // Refetch moment when screen gains focus to ensure freshest data
    useFocusEffect(
        useCallback(() => {
            let cancelled = false
            async function refetch() {
                try {
                    const token = session?.account?.jwtToken
                    const auth = token?.startsWith("Bearer ")
                        ? token
                        : token
                          ? `Bearer ${token}`
                          : ""
                    const res = await api.get(
                        `/moments/${momentId}`,
                        auth ? { headers: { Authorization: auth } } : undefined,
                    )
                    if (!cancelled) {
                        const payload = (res as any)?.data?.moment ?? (res as any)?.data ?? null
                        setRemoteMoment(payload)
                    }
                } catch (e) {
                    console.log("Moment refetch error:", e)
                }
            }
            if (momentId) refetch()
            return () => {
                cancelled = true
            }
        }, [momentId, session?.account?.jwtToken]),
    )
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
    const { rewrite } = useRewriteUrl()

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

    const momentData = React.useMemo(() => {
        const fallbackList = (moments as any[]) || []
        const raw =
            remoteMoment ?? fallbackList.find((m: any) => String(m?.id) === String(momentId))
        if (!raw) return null

        const videoUrl = rewrite(
            (raw?.midia?.fullhd_resolution as string) ||
                (raw?.midia?.nhd_resolution as string) ||
                raw?.video?.url,
        )
        const thumbUrl = rewrite(
            (raw?.midia?.nhd_thumbnail as string) ||
                raw?.thumbnail?.url ||
                (raw?.thumbnail as string),
        )

        return {
            id: String(raw.id),
            user: {
                id: String(raw?.user?.id ?? profile?.id ?? ""),
                username: String(raw?.user?.username ?? profile?.username ?? ""),
                profilePicture: rewrite(
                    String(raw?.user?.profilePicture ?? profile?.profilePicture ?? ""),
                ),
                // removed: verified, youFollow, followYou per required shape
                // using raw.user when available; falling back to profile
                // end user
            },
            description: String(raw?.description ?? ""),
            media: videoUrl,
            thumbnail: thumbUrl,
            duration: Number(raw?.video?.duration ?? raw?.midia?.duration ?? 0),
            size: String(raw?.video?.size ?? raw?.video?.fileSize ?? raw?.midia?.size ?? ""),
            hasAudio: Boolean(raw?.hasAudio ?? raw?.video?.hasAudio ?? true),
            ageRestriction: Boolean(raw?.ageRestriction ?? false),
            contentWarning: Boolean(raw?.contentWarning ?? false),
            metrics: raw.metrics || {
                totalViews: 0,
                totalLikes: 0,
                totalComments: 0,
            },
            publishedAt: String(raw.publishedAt),
            topComment: raw.topComment || null,
            isLiked: Boolean(raw.isLiked ?? false),
        } as any
    }, [momentId, remoteMoment, moments])

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
            {momentData ? (
                <Moment.Root.Main
                    size={sizes.moment.standart}
                    isFeed={false}
                    isFocused={true}
                    data={momentData}
                    shadow={{ top: false, bottom: true }}
                >
                    <Animated.View style={animatedMomentStyle}>
                        <Moment.Container
                            contentRender={momentData.media}
                            isFocused={true}
                            loading={false}
                            blurRadius={30}
                            forceMute={false}
                            showSlider={true}
                            disableCache={true}
                            disableWatch={false}
                        >
                            {/* Top user info (no scale animations) */}
                            <Moment.Root.Top>
                                <Moment.Root.TopLeft>
                                    <UserShow.Root data={momentData.user}>
                                        <UserShow.ProfilePicture
                                            disableAction={true}
                                            displayOnMoment={true}
                                            pictureDimensions={{ width: 30, height: 30 }}
                                        />
                                        <UserShow.Username
                                            pressable={false}
                                            fontFamily={fonts.family["Bold-Italic"]}
                                        />
                                    </UserShow.Root>
                                </Moment.Root.TopLeft>
                            </Moment.Root.Top>
                            <Moment.Root.Center>
                                <View
                                    style={{
                                        marginBottom: sizes.margins["2sm"],
                                        width: "100%",
                                        zIndex: 1,
                                    }}
                                >
                                    <View style={{ marginLeft: 6, marginBottom: 10 }}>
                                        <Moment.Description />
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <View style={{ flex: 1, height: 46 }}>
                                            <Moment.LikeButtonIOS isLiked={false} />
                                        </View>
                                        <View>
                                            <Moment.AudioControl />
                                        </View>
                                    </View>
                                </View>
                            </Moment.Root.Center>

                            {/* Subtle bottom gradient like feed */}
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
                    {momentData?.topComment ? (
                        <RenderCommentFeed moment={momentData} focused={true} />
                    ) : (
                        <View
                            style={{
                                alignSelf: "center",
                                marginTop: sizes.margins["2sm"],
                            }}
                        >
                            <ZeroComments isAccount={false} moment={momentData} />
                        </View>
                    )}
                </Moment.Root.Main>
            ) : null}
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
                        momentId={String(momentData?.id ?? momentId)}
                        autoFocus={true}
                        onSent={() => setCommentEnabled(false)}
                    />
                </RNAnimated.View>
            )}
        </SafeAreaView>
    )
}
