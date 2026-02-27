import React, { useEffect, useCallback } from "react"
import { View, Keyboard, Platform, Animated as RNAnimated, Pressable } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useLocalSearchParams } from "expo-router"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import PersistedContext from "@/contexts/Persisted"
import { Moment } from "@/components/moment"
import sizes from "@/constants/sizes"
import config from "@/config"
import { UserShow } from "@/components/user_show"
import { LinearGradient } from "expo-linear-gradient"
import fonts from "@/constants/fonts"
import api from "@/api"
import RenderCommentFeed from "@/features/moments/feed/render-comment-feed"
import Input from "@/components/comment/components/comments-profile-input"
import ZeroComments from "@/components/comment/components/comments-zero_comments"
import FeedContext from "@/contexts/Feed"
import useUniqueAppend from "@/lib/hooks/useUniqueAppend"
import { isIPad11 } from "@/lib/platform/detection"

export default function MomentFullScreen() {
    const { id } = useLocalSearchParams<{ id: string; from?: string }>()
    const { session } = React.useContext(PersistedContext)
    const { commentEnabled, setCommentEnabled } = React.useContext(FeedContext)

    const {
        items: uniqueMoments,
        appendOneUnique,

        appendUnique,
        resetUnique,
    } = useUniqueAppend<any>({
        keySelector: (m) => m?.id,
    })

    const [isLoadingMoment, setIsLoadingMoment] = React.useState(false)
    const fetchInProgressRef = React.useRef(false)

    // Fetch moment by id (GET /moments/:id) with Authorization
    useEffect(() => {
        let cancelled = false
        async function fetchMoment() {
            if (fetchInProgressRef.current) return
            fetchInProgressRef.current = true
            try {
                setIsLoadingMoment(true)
                const token = session?.account?.jwtToken
                const auth = token?.startsWith("Bearer ") ? token : token ? `Bearer ${token}` : ""
                const res = await api.get(
                    `/moments/${id}`,
                    auth ? { headers: { Authorization: auth } } : undefined,
                )
                if (!cancelled) {
                    const payload = (res as any)?.data?.moment ?? (res as any)?.data ?? null
                    if (!payload) return

                    // Support single payload or chunk (array)
                    const incoming: any[] = Array.isArray(payload) ? payload : [payload]

                    // Current chunk ids already rendered
                    const currentIds = new Set(uniqueMoments.map((m: any) => String(m?.id)))
                    const currentChunkIds = Array.from(currentIds)

                    // New chunk ids from incoming payload
                    const newChunkIds = incoming
                        .map((m) => String(m?.id))
                        .filter((v): v is string => !!v)

                    // Only append items that are not yet present
                    const uniqueIncoming = incoming.filter((m) => !currentIds.has(String(m?.id)))

                    if (uniqueIncoming.length === 1) appendOneUnique(uniqueIncoming[0])
                    else if (uniqueIncoming.length > 1) appendUnique(uniqueIncoming)

                    // Debug if needed:
                    // console.debug({ currentChunkIds, newChunkIds, uniqueNewChunkIds: uniqueIncoming.map(m => String(m?.id)) })
                }
            } catch (e) {
                console.log("Moment fetch error:", e)
            } finally {
                if (!cancelled) setIsLoadingMoment(false)
                fetchInProgressRef.current = false
            }
        }
        if (id) fetchMoment()
        return () => {
            cancelled = true
        }
    }, [id, session?.account?.jwtToken, uniqueMoments, appendOneUnique, appendUnique])

    React.useEffect(() => {
        const list = ((session?.account as any)?.moments as any[]) || []
        if (Array.isArray(list) && list.length) resetUnique(list as any[])
    }, [session?.account?.moments, resetUnique])

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

    const momentData = React.useMemo(() => {
        const rewrite = (url: string) => {
            if (!url) return url
            const original = String(url).trim()
            const newBase = `${config.ENDPOINT}`
            if (original.startsWith("/")) return `${newBase}${original}`
            const protoMatch = original.match(/^https?:\/\//i)
            if (protoMatch) {
                const afterProto = original.slice(protoMatch[0].length)
                const hostPort = afterProto.split("/")[0]
                const path = afterProto.slice(hostPort.length) || "/"
                const oldHosts = ["10.15.0.235:3000", "10.168.15.17:3000", "172.31.80.1:3000"]
                if (oldHosts.includes(hostPort) || hostPort === config.ENDPOINT) {
                    return `${newBase}${path}`
                }
                return original
            }
            return original
        }

        const raw = uniqueMoments.find((m: any) => String(m?.id) === String(id))
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
                id: String(raw?.user?.id || session?.user?.id || ""),
                username: String(raw?.user?.username || session?.user?.username || ""),
                verified: Boolean(raw?.user?.verified ?? session?.user?.isVerified ?? false),
                profilePicture: String(
                    raw?.user?.profilePicture || session?.user?.profilePicture || "",
                ),
                youFollow: Boolean(raw?.user?.youFollow ?? false),
                followYou: Boolean(raw?.user?.followYou ?? false),
            },
            description: raw.description || "",
            media: videoUrl,
            thumbnail: thumbUrl,
            midia: {
                content_type: "VIDEO",
                fullhd_resolution: videoUrl,
                nhd_resolution: videoUrl,
                nhd_thumbnail: thumbUrl,
            },
            metrics: raw.metrics || {
                totalViews: 0,
                totalLikes: 0,
                totalComments: 0,
            },
            tags: raw.tags || [],
            language: raw.language || "pt",
            publishedAt: raw.publishedAt,
            topComment: raw.topComment || null,
            isLiked: Boolean(raw.isLiked ?? false),
        } as any
    }, [id, uniqueMoments, session?.user])

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
            <View
                style={{ height: isIPad11 ? sizes.headers.height * 1.2 : sizes.headers.height * 0.7 }}
            />
            {momentData ? (
                <>
                    <Moment.Root.Main
                        size={sizes.moment.standart}
                        isFeed={false}
                        isFocused={true}
                        data={momentData}
                        shadow={{ top: false, bottom: true }}
                    >
                        <Animated.View style={animatedMomentStyle}>
                            <Moment.Container
                                contentRender={momentData.midia}
                                isFocused={true}
                                loading={isLoadingMoment}
                                blurRadius={30}
                                forceMute={false}
                                showSlider={true}
                                disableCache={false}
                                disableWatch={true}
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
                                    <Moment.Description />
                                </Moment.Root.Center>

                                {/* Bottom description opens comments modal */}
                                <Moment.Root.Bottom>
                                    <View style={{ marginBottom: 7, marginLeft: 5 }}>
                                        <Moment.AudioControl />
                                    </View>
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
                                <ZeroComments isAccount={true} moment={momentData} />
                            </View>
                        )}
                    </Moment.Root.Main>
                </>
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
                        momentId={momentData.id}
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
