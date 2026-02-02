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
import ProfileContext from "@/contexts/profile"
import PersistedContext from "@/contexts/Persisted"
import { RenderProfileSkeleton } from "@/features/profile/profile.skeleton"
import { ProfileHeader } from "@/features/profile"
import sizes from "@/constants/sizes"
import { Moment } from "@/components/moment"
import useRewriteUrl from "@/lib/hooks/useRewriteUrl"
import { colors } from "@/constants/colors"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { router, useLocalSearchParams } from "expo-router"
import { NoMoments } from "@/features/profile/profile.no.moments"
import fonts from "@/constants/fonts"
import { NetworkContext } from "@/contexts/network"
import OfflineCard from "@/components/general/offline"

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
    } = React.useContext(ProfileContext)
    const { session } = React.useContext(PersistedContext)
    const { cleanProfile } = React.useContext(ProfileContext)
    const { userId } = useLocalSearchParams<{ userId: string }>()
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
        const u = {
            id: Number(profile.id),
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
                isFollowing: false,
                isFollowedBy: false,
                isBlockedBy: false,
                isBlocking: false,
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
        <FlatList
            overScrollMode="always"
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
                    tintColor="#888"
                    colors={["#888"]}
                    progressBackgroundColor="#000"
                    progressViewOffset={
                        iOSMajorVersion! >= 26
                            ? sizes.headers.height * 1.6
                            : sizes.headers.height * 1.2
                    }
                />
            }
            ListHeaderComponent={
                loading ? (
                    <>
                        <View
                            style={{
                                paddingTop:
                                    iOSMajorVersion! >= 26
                                        ? sizes.headers.height * 1.6
                                        : sizes.headers.height * 1.2,
                            }}
                        />
                        <RenderProfileSkeleton />
                    </>
                ) : user ? (
                    <>
                        <View
                            style={{
                                paddingTop:
                                    iOSMajorVersion! >= 26
                                        ? sizes.headers.height * 1.6
                                        : sizes.headers.height * 1.2,
                            }}
                        />
                        <ProfileHeader
                            user={user}
                            isAccount={false}
                            totalMoments={user.metrics.totalMomentsCreated}
                            lastUpdateDate={lastCreatedAt ?? new Date()}
                        />
                    </>
                ) : (
                    <>
                        <View
                            style={{
                                paddingTop:
                                    iOSMajorVersion! >= 26
                                        ? sizes.headers.height * 1.6
                                        : sizes.headers.height * 1.2,
                            }}
                        />
                        <RenderProfileSkeleton />
                    </>
                )
            }
            renderItem={({ item }) => {
                const isVisible = true

                if (!isOnline) return null
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
                            <Pressable
                                onPress={() => {
                                    router.navigate({
                                        pathname: "/profile/moment/[momentId]",
                                        params: {
                                            momentId: String(item.id),
                                        },
                                    })
                                }}
                            >
                                <Moment.Root.Main
                                    size={{
                                        ...sizes.moment.small,
                                        width: ITEM_SIZE,
                                        height: ITEM_SIZE * sizes.moment.aspectRatio,
                                        borderRadius: sizes.moment.small.borderRadius * 0.7,
                                    }}
                                    isFeed={false}
                                    isFocused={isVisible}
                                    data={item}
                                    shadow={{ top: false, bottom: true }}
                                >
                                    <Moment.Container
                                        contentRender={item.media}
                                        isFocused={isVisible}
                                        loading={false}
                                        blurRadius={0}
                                        forceMute={true}
                                        showSlider={false}
                                        disableCache={true}
                                        disableWatch={true}
                                    >
                                        <Moment.Root.Center />
                                        <Moment.Root.Bottom>
                                            <View style={{ marginLeft: 5, marginBottom: 2 }}>
                                                <Moment.Description displayOnMoment={true} />
                                                <Moment.Date />
                                            </View>
                                        </Moment.Root.Bottom>
                                    </Moment.Container>
                                </Moment.Root.Main>
                            </Pressable>
                        </View>
                    )
            }}
            onEndReached={async () => {
                await handleLoadMore()
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => {
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
    )
}
