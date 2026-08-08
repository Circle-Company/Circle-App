import {
    FlatList,
    View,
    Dimensions,
    ActivityIndicator,
    Pressable,
    Text,
    RefreshControl,
} from "react-native"
import React, { useState, useEffect, useMemo } from "react"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import ProfileContext from "@/contexts/profile"
import PersistedContext from "@/contexts/Persisted"
import { RenderProfileSkeleton } from "@/features/profile/profile.skeleton"
import { ProfileHeader } from "@/features/profile"
import { ProfileReportModal } from "@/features/profile/profile.report.modal"
import { SwiftBottomSheet } from "@/components/ios/ios.bottom.sheet"
import sizes from "@/constants/sizes"
import { Moment } from "@/components/moment"
import useRewriteUrl from "@/lib/hooks/useRewriteUrl"
import { colors } from "@/constants/colors"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { Link, Stack, useLocalSearchParams } from "expo-router"
import { NoMoments } from "@/features/profile/profile.no.moments"
import fonts from "@/constants/fonts"
import { NetworkContext } from "@/contexts/network"
import OfflineCard from "@/components/general/offline"
import { ProfileDropDownMenuIOS } from "@/features/profile/profile.moments.dropdown.menu"
import { ProfileOptionsDropDownMenuIOS } from "@/features/profile/profile.dropdown.menu"
import LanguageContext from "@/contexts/language"

export default function ProfileScreen() {
    const {
        profile,
        moments,
        isLoadingProfile,
        isLoadingMoments,
        getProfile,
        getMoments,
        setUserId,
        totalMoments,
        setTotalMoments,
        setMoments,
        showReportModal,
        setShowReportModal,
    } = React.useContext(ProfileContext)
    const { session } = React.useContext(PersistedContext)
    const { cleanProfile } = React.useContext(ProfileContext)
    const { t } = React.useContext(LanguageContext)
    const { userId } = useLocalSearchParams<{ userId: string }>()
    const usernameTitle = profile?.username ? `@${profile.username}` : t("Profile")
    const { networkStats } = React.useContext(NetworkContext)
    const { rewrite } = useRewriteUrl()
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMoreMoments, setHasMoreMoments] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    // Guards to prevent duplicate fetches and pagination races
    const loadingMoreRef = React.useRef(false)
    const lastRequestedPageRef = React.useRef<number | null>(null)
    const refreshInProgressRef = React.useRef(false)

    const pageSize = 6
    useEffect(() => {
        if (userId) {
            const id = String(userId)
            setUserId(id)
            getProfile(id)
            getMoments({ page: 1, limit: pageSize, userId: id })
        } else {
            console.log("[Profile] userId missing; skipping fetch")
        }
    }, [userId])

    const loading = isLoadingProfile || isLoadingMoments
    const { width } = Dimensions.get("window")
    const SPACING = 5
    const NUM_COLUMNS = 2
    const ITEM_SIZE = (width - (NUM_COLUMNS + 1) * SPACING) / NUM_COLUMNS
    const isOnline = networkStats === "ONLINE"
    // navigation declared above

    const user = useMemo(() => {
        if (!profile || !profile.id) {
            return null
        }
        const u: typeof profile = {
            id: profile.id,
            username: profile.username,
            name: profile.name ?? null,
            description: profile.description ?? null,
            profilePicture: profile.profilePicture ?? null,
            status: { verified: !!profile.status?.verified },
            metrics: {
                totalMomentsCreated:
                    typeof totalMoments === "number" ? totalMoments : (moments?.length ?? 0),
                totalFollowers: profile.metrics?.totalFollowers ?? 0,
            },
            interactions: {
                isFollowedBy: profile.interactions?.isFollowedBy ?? false,
                isBlockedBy: profile.interactions?.isBlockedBy ?? false,
                isBlocking: profile.interactions?.isBlocking ?? false,
                isFollowing: profile.interactions?.isFollowing ?? false,
            },
        }
        return u
    }, [profile, totalMoments, moments])

    const handleRefresh = async () => {
        // Prevent concurrent refresh
        if (refreshing || refreshInProgressRef.current) return
        refreshInProgressRef.current = true
        try {
            setRefreshing(true)
            // Reset to first page when refreshing
            setCurrentPage(1)
            setHasMoreMoments(true)
            // Reset pagination guards
            loadingMoreRef.current = false
            lastRequestedPageRef.current = null

            await getProfile(String(userId))
            await getMoments({ page: 1, limit: pageSize, userId: String(userId) })
        } catch (error) {
            console.error("Error refreshing profile data:", error)
        } finally {
            setRefreshing(false)
            refreshInProgressRef.current = false
        }
    }

    const handleLoadMore = async () => {
        // Block if loading or no more items or refreshing
        if (loadingMoreRef.current || isLoadingMoments || refreshing || !hasMoreMoments) return

        const nextPage = currentPage + 1
        // Prevent duplicate same-page requests caused by repeated onEndReached
        if (lastRequestedPageRef.current === nextPage) return

        loadingMoreRef.current = true
        lastRequestedPageRef.current = nextPage
        try {
            const list = await getMoments({
                page: nextPage,
                limit: pageSize,
                userId: String(userId),
            })
            if (list && list.length > 0) {
                console.log(`📄 Loaded page ${nextPage}`)
                setCurrentPage(nextPage)
            } else {
                console.log("📭 No more moments to load")
                setHasMoreMoments(false)
            }
        } catch (e) {
            console.error("Error loading more moments:", e)
        } finally {
            loadingMoreRef.current = false
        }
    }

    const normalizedMoments = moments.map((moment: any) => {
        return {
            ...moment,
            user: {
                id: String(profile?.id || ""),
                username: String(profile?.username || ""),
                profilePicture: rewrite(String(profile?.profilePicture || "")) || "",
                verified: !!profile?.status?.verified,
                youFollow: !!profile?.interactions?.isFollowing,
                followYou: !!profile?.interactions?.isFollowedBy,
            },
            media: rewrite((moment?.midia?.fullhd_resolution as string) || moment?.video?.url),
            thumbnail: rewrite((moment?.midia?.nhd_thumbnail as string) || moment?.thumbnail?.url),
        } as any
    })

    const lastCreatedAt = useMemo(() => {
        if (!Array.isArray(moments) || moments.length === 0) return undefined
        const getDate = (m: any) =>
            m?.publishedAt || m?.createdAt || m?.created_at || m?.date || m?.timestamp
        const timestamps = moments
            .map((m: any) => {
                const d = getDate(m)
                const ts = d ? new Date(d as any).getTime() : NaN
                return ts
            })
            .filter((ts: number) => Number.isFinite(ts))
        if (timestamps.length === 0) return undefined
        const maxTs = Math.max(...timestamps)
        return new Date(maxTs)
    }, [moments])

    // Clear profile data when leaving this screen
    useEffect(() => {
        return () => {
            try {
                cleanProfile()
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e)
                console.log("[Profile] cleanProfile error", msg)
            }
        }
    }, [])

    useEffect(() => {
        if (moments) {
            if (typeof setMoments === "function") {
                setMoments(moments as any)
            }
            if (typeof totalMoments !== "number" || totalMoments === 0) {
                if (typeof setTotalMoments === "function") {
                    setTotalMoments(moments.length)
                }
            }
        }
    }, [moments, totalMoments, setMoments, setTotalMoments])

    return (
        <>
        <Stack.Screen
            options={{
                headerShown: true,
                headerTransparent: true,
                headerTitleAlign: "center",
                headerLargeTitle: false,
                headerLargeTitleShadowVisible: false,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: "transparent" },
                headerTintColor: colors.gray.white,
                headerTitleStyle: {
                    fontFamily: fonts.family["Black-Italic"],
                    fontSize: fonts.size.title2 * 0.9,
                    color: colors.gray.white,
                },
                headerTitle: usernameTitle,
                headerBackTitle: t("Back"),
                headerRight: () => <ProfileOptionsDropDownMenuIOS profile={profile} />,
            }}
        />
        <FlatList
            data={normalizedMoments}
            numColumns={NUM_COLUMNS}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            alwaysBounceVertical={true}
            bounces={true}
            columnWrapperStyle={{ justifyContent: "flex-start", marginBottom: SPACING }}
            contentContainerStyle={{
                paddingHorizontal: SPACING,
                backgroundColor: "#000",
                flexGrow: 1,
            }}
            keyExtractor={(item: any) => item.id}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={colors.gray.grey_04}
                    colors={[colors.gray.grey_04]}
                    progressViewOffset={sizes.headers.height * 1.45}
                />
            }
            ListHeaderComponent={
                <>
                    <View
                        style={{
                            paddingTop:
                                iOSMajorVersion! >= 26
                                    ? sizes.headers.height * 1.6
                                    : sizes.headers.height * 1.2,
                        }}
                    />
                    {loading || !user ? (
                        <Animated.View
                            key="skeleton"
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(220)}
                        >
                            <RenderProfileSkeleton />
                        </Animated.View>
                    ) : (
                        <Animated.View
                            key="header"
                            entering={FadeIn.duration(320).delay(80)}
                            exiting={FadeOut.duration(180)}
                        >
                            <ProfileHeader
                                user={user as any}
                                isAccount={false}
                                totalMoments={user.metrics.totalMomentsCreated}
                                lastUpdateDate={lastCreatedAt ?? new Date()}
                            />
                        </Animated.View>
                    )}
                </>
            }
            renderItem={({ item }) => {
                if (!isOnline) return null
                else if (user?.interactions?.isBlocking) return null
                else if (user?.interactions?.isBlockedBy) return null
                else
                    return (
                        <View
                            style={{
                                width: ITEM_SIZE,
                                marginRight: SPACING,
                                borderRadius: sizes.moment.small.borderRadius * 0.7,
                                borderWidth: iOSMajorVersion! >= 26 ? 0 : 1,
                                borderColor:
                                    iOSMajorVersion! >= 26 ? "#00000000" : colors.gray.grey_09,
                                overflow: "hidden",
                            }}
                        >
                            <Link
                                href={{
                                    pathname: "/profile/moment/[momentId]",
                                    params: { momentId: String(item.id) },
                                }}
                                push
                                asChild
                            >
                                <Pressable>
                                    {/* Mesma transição de zoom da tela de conta.
                                        O AppleZoom monta apenas UM filho nativo,
                                        daí a View única envolvendo o momento. */}
                                    <Link.AppleZoom>
                                        <View>
                                            <Moment.Root.Main
                                                size={{
                                                    ...sizes.moment.small,
                                                    width: ITEM_SIZE,
                                                    height: ITEM_SIZE * sizes.moment.aspectRatio,
                                                    borderRadius:
                                                        sizes.moment.small.borderRadius * 0.7,
                                                }}
                                                isFeed={false}
                                                isFocused={true}
                                                data={item}
                                                shadow={{ top: false, bottom: true }}
                                            >
                                                <ProfileDropDownMenuIOS>
                                                    <Moment.Container
                                                        contentRender={item.media}
                                                        isFocused={true}
                                                        loading={false}
                                                        blurRadius={0}
                                                        forceMute={true}
                                                        showSlider={false}
                                                        disableCache={false}
                                                        disableWatch={true}
                                                    >
                                                        <Moment.Root.Center />
                                                        <Moment.Root.Bottom>
                                                            <View
                                                                style={{
                                                                    marginLeft: 5,
                                                                    marginBottom: 2,
                                                                }}
                                                            >
                                                                <View
                                                                    style={{
                                                                        alignSelf: "flex-start",
                                                                        marginBottom: 4,
                                                                    }}
                                                                >
                                                                    <Moment.LikeButtonIOS
                                                                        isLiked={false}
                                                                        size={44}
                                                                    />
                                                                </View>
                                                                <Moment.Date />
                                                            </View>
                                                        </Moment.Root.Bottom>
                                                    </Moment.Container>
                                                </ProfileDropDownMenuIOS>
                                            </Moment.Root.Main>
                                        </View>
                                    </Link.AppleZoom>
                                </Pressable>
                            </Link>
                        </View>
                    )
            }}
            onEndReached={async () => {
                await handleLoadMore()
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => {
                if (user?.interactions?.isBlocking) return null
                if (user?.interactions?.isBlockedBy) return null
                if (!isOnline) {
                    return <OfflineCard />
                }
                if (isLoadingMoments) {
                    return (
                        <View
                            style={{
                                paddingVertical: sizes.paddings["1md"],
                                alignItems: "center",
                            }}
                        >
                            <ActivityIndicator
                                style={{ transform: [{ scale: 1.4 }] }}
                                color="#888"
                            />
                        </View>
                    )
                } else if (!isLoadingMoments && !hasMoreMoments && moments.length === 0) {
                    return (
                        <View
                            style={{
                                paddingVertical: sizes.paddings["1md"],
                                alignItems: "center",
                            }}
                        >
                            <NoMoments />
                        </View>
                    )
                } else if (!hasMoreMoments) {
                    return (
                        <View
                            style={{
                                paddingVertical: sizes.paddings["1md"],
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.gray.grey_04,
                                    fontFamily: fonts.family.Semibold,
                                    fontStyle: "italic",
                                }}
                            >
                                No more moments
                            </Text>
                        </View>
                    )
                }
            }}
        />
        <SwiftBottomSheet
            snapPoints={[1]}
            isOpened={showReportModal}
            onIsOpenedChange={(opened) => {
                if (!opened) setShowReportModal(false)
            }}
        >
            <ProfileReportModal />
        </SwiftBottomSheet>
        </>
    )
}
