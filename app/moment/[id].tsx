import React, { useEffect, useRef } from "react"
import { BackHandler } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import PersistedContext from "@/contexts/Persisted"
import { Moment } from "@/components/moment"
import sizes from "@/constants/sizes"
import config from "@/config"
import { UserShow } from "@/components/user_show"
import { LinearGradient } from "expo-linear-gradient"
import fonts from "@/constants/fonts"
import api from "@/api"
import { View, Keyboard, Platform, Animated as RNAnimated, Modal, Pressable } from "react-native"
import RenderCommentFeed from "@/features/moments/feed/render-comment-feed"
import ZeroComments from "@/components/comment/components/comments-zero_comments"

export default function MomentFullScreen() {
    const router = useRouter()
    const navigation = useNavigation()
    const hasNavigatedRef = useRef(false)
    const { id, from } = useLocalSearchParams<{ id: string; from?: string }>()
    const { session } = React.useContext(PersistedContext)

    const [remoteMoment, setRemoteMoment] = React.useState<any | null>(null)

    // Fetch moment by id (GET /moments/:id) with Authorization
    useEffect(() => {
        let cancelled = false
        async function fetchMoment() {
            try {
                const token = session?.account?.jwtToken
                const auth = token?.startsWith("Bearer ") ? token : token ? `Bearer ${token}` : ""
                const res = await api.get(
                    `/moments/${id}`,
                    auth ? { headers: { Authorization: auth } } : undefined,
                )
                if (!cancelled) {
                    setRemoteMoment((res as any)?.data?.moment ?? (res as any)?.data ?? null)
                }
            } catch (e) {
                console.log("Moment fetch error:", e)
            }
        }
        if (id) fetchMoment()
        return () => {
            cancelled = true
        }
    }, [id, session?.account?.jwtToken])

    const keyboardHeightAnim = React.useRef(new RNAnimated.Value(0)).current

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
            },
        )

        return () => {
            showListener.remove()
            hideListener.remove()
        }
    }, [])

    const momentData = React.useMemo(() => {
        const rewrite = (url: string) => {
            if (!url) return url
            const original = String(url).trim()
            const newBase = `http://${config.ENDPOINT}`
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

        const fallbackList = ((session?.account as any)?.moments as any[]) || []
        const raw = remoteMoment ?? fallbackList.find((m) => String(m?.id) === String(id))
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
            isLiked: Boolean(raw.isLiked ?? false),
        } as any
    }, [id, remoteMoment, session?.account?.moments, session?.user])

    useEffect(() => {
        if (momentData?.user?.username) {
            // set stack title to owner's username
            // @ts-ignore
            navigation.setOptions({ title: String(momentData.user.username) })
        }
    }, [momentData?.user?.username, navigation])

    useEffect(() => {
        if (from !== "you") return

        const unsubscribe = navigation.addListener("beforeRemove", (e) => {
            const actionType = (e as any)?.data?.action?.type
            if ((actionType === "POP" || actionType === "GO_BACK") && !hasNavigatedRef.current) {
                e.preventDefault()
                hasNavigatedRef.current = true
                router.replace("/(tabs)/you")
            }
        })

        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (hasNavigatedRef.current) return true
            hasNavigatedRef.current = true
            router.replace("/(tabs)/you")
            return true
        })

        return () => {
            unsubscribe && unsubscribe()
            backHandler.remove()
            hasNavigatedRef.current = false
        }
    }, [from, router, navigation])

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
                    <Moment.Container
                        contentRender={momentData.midia}
                        isFocused={true}
                        loading={false}
                        blurRadius={0}
                        forceMute={false}
                        showSlider={true}
                        disableCache={false}
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
                            <Moment.Description displayOnMoment={true} />
                        </Moment.Root.Center>

                        {/* Bottom description opens comments modal */}
                        <Moment.Root.Bottom>
                            <Moment.Date />
                            <Moment.AudioControl />
                        </Moment.Root.Bottom>

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
                    {momentData?.topComment ? (
                        <RenderCommentFeed moment={momentData} focused={true} />
                    ) : (
                        <View
                            style={{
                                alignSelf: "center",
                                marginTop: sizes.margins["2sm"],
                            }}
                        >
                            <ZeroComments moment={momentData} />
                        </View>
                    )}
                </Moment.Root.Main>
            ) : null}
        </SafeAreaView>
    )
}
