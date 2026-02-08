import {
    FlatList,
    View,
    Dimensions,
    ActivityIndicator,
    Pressable,
    Text,
    RefreshControl,
    Platform,
    Alert,
} from "react-native"
import React, { useState, useEffect, useMemo, useRef } from "react"
import AccountContext from "@/contexts/account"
import PersistedContext from "@/contexts/Persisted"
import { RenderProfileSkeleton } from "@/features/profile/profile.skeleton"
import { ProfileHeader } from "@/features/profile"
import sizes from "@/constants/sizes"
import { Moment } from "@/components/moment"
import config from "@/config"
import { colors } from "@/constants/colors"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { router } from "expo-router"
import { useNavigation } from "@react-navigation/native"
import { NoMoments } from "@/features/profile/profile.no.moments"
import fonts from "@/constants/fonts"
import { NetworkContext } from "@/contexts/network"
import OfflineCard from "@/components/general/offline"
import { DropDownMenuIOS } from "@/features/account/account.moments.dropdown.menu"
import { apiRoutes } from "@/api"

export default function AccountScreen() {
    const { account, moments, isLoadingAccount, isLoadingMoments, getAccount, getMoments } =
        React.useContext(AccountContext)
    const { session } = React.useContext(PersistedContext)
    const { networkStats } = React.useContext(NetworkContext)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMoreMoments, setHasMoreMoments] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Guards to avoid duplicate loads
    const loadingMoreRef = useRef(false)
    const lastRequestedPageRef = useRef<number | null>(null)
    const refreshInProgressRef = useRef(false)

    const pageSize = 6
    const userSnapshotRef = useRef<string>("")

    const loading = isLoadingAccount || isLoadingMoments
    const { width } = Dimensions.get("window")
    const SPACING = 5
    const NUM_COLUMNS = 2
    const ITEM_SIZE = (width - (NUM_COLUMNS + 1) * SPACING) / NUM_COLUMNS
    const isOnline = networkStats === "ONLINE"
    const navigation = useNavigation()

    const user = useMemo(() => {
        if (!account || !account.id) return null
        return {
            id: Number(account.id),
            username: account.username,
            name: account.name ?? null,
            description: account.description ?? null,
            profilePicture: account.profilePicture ?? null,
            status: { verified: !!account.status?.verified },
            metrics: {
                totalMomentsCreated:
                    typeof session.account.totalMoments === "number"
                        ? session.account.totalMoments
                        : (moments?.length ?? 0),
                totalFollowers: account.metrics?.totalFollowers ?? 0,
            },
            interactions: {
                isFollowing: false,
                isFollowedBy: false,
                isBlockedBy: false,
                isBlocking: false,
            },
        }
    }, [account, session.account.totalMoments, moments])

    // Update header title with username (null-safe)
    useEffect(() => {
        const title =
            (user && (user.username || user.name)) || (session?.user?.username ?? "") || ""
        // Avoid setting undefined titles
        try {
            // @ts-ignore - navigation types depend on navigator setup
            navigation.setOptions?.({ title })
        } catch {}
    }, [navigation, user?.username, user?.name, session?.user?.username])

    useEffect(() => {
        // Initialize data on mount
        ;(async () => {
            await getAccount()
            await getMoments({ page: 1, limit: pageSize })
        })()
    }, [])

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

            await getAccount()
            await getMoments({ page: 1, limit: pageSize })
        } catch (error) {
            console.error("Error refreshing account data:", error)
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
            const list = await getMoments({ page: nextPage, limit: pageSize })
            if (Array.isArray(list) && list.length > 0) {
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

    async function handleDeleteMoment(id: string) {
        try {
            await apiRoutes.moment.author.exclude({
                momentId: id,
                authorizationToken: session.account.jwtToken,
            })

            const currentTotal = Number(session.account.totalMoments ?? 0)
            session.account.setTotalMoments(Math.max(0, currentTotal - 1))

            setHasMoreMoments(true)
            setCurrentPage(1)
            await getMoments({ page: 1, limit: pageSize })
        } catch (error) {
            console.error("Error deleting moment:", error)
        }
    }

    function confirmDelete(id: string) {
        Alert.alert("Delete Moment", "You will permanently remove it.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => handleDeleteMoment(id) },
        ])
    }

    function navigateToViewMoment(id: string) {
        router.navigate({ pathname: "/you/[id]", params: { id: String(id), from: "you" } })
    }

    const normalizedMoments = (moments ?? []).map((moment: any) => {
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

        return {
            ...moment,
            user: {
                ...session.user,
                profilePicture: rewrite(session?.user?.profilePicture) || "",
                youFollow: false,
                followYou: false,
            },
            media: rewrite((moment?.midia?.fullhd_resolution as string) || moment?.video?.url),
            thumbnail: rewrite((moment?.midia?.nhd_thumbnail as string) || moment?.thumbnail?.url),
        } as any
    })

    // Sync Persisted session when context data changes
    useEffect(() => {
        if (account) {
            session.user.set({
                id: account.id,
                username: account.username,
                name: account.name,
                description: account.description,
                richDescription: account.description,
                isVerified: !!account.status?.verified,
                isActive: session.user.isActive,
                profilePicture: account.profilePicture,
            })

            session.metrics.set({
                totalFollowers: account.metrics?.totalFollowers ?? 0,
                totalFollowing: account.metrics?.totalFollowing ?? 0,
                totalLikesReceived: account.metrics?.totalLikesReceived ?? 0,
                totalViewsReceived: account.metrics?.totalViewsReceived ?? 0,
                followerGrowthRate30d: account.metrics?.followerGrowthRate30d ?? 0,
                engagementGrowthRate30d: account.metrics?.engagementGrowthRate30d ?? 0,
                interactionsGrowthRate30d: account.metrics?.interactionsGrowthRate30d ?? 0,
            })
            if (
                typeof session.account.totalMoments !== "number" ||
                session.account.totalMoments === 0
            ) {
                session.account.setTotalMoments(moments?.length ?? 0)
            }
        }
    }, [account])

    useEffect(() => {
        if (moments) {
            session.account.setMoments(moments as any)
            if (
                typeof session.account.totalMoments !== "number" ||
                session.account.totalMoments === 0
            ) {
                session.account.setTotalMoments(moments.length)
            }
        }
    }, [moments])

    // Snapshot session.user fields; if any field changes compared to the last snapshot, refetch account
    useEffect(() => {
        if (!account) return

        const fingerprint = JSON.stringify({
            id: session?.user?.id ?? "",
            username: session?.user?.username ?? "",
            name: session?.user?.name ?? "",
            description: session?.user?.description ?? "",
            richDescription: session?.user?.richDescription ?? "",
            isVerified: !!session?.user?.isVerified,
            isActive: !!session?.user?.isActive,
            profilePicture: session?.user?.profilePicture ?? "",
        })

        // Only refetch when there's a previous snapshot and it differs
        if (userSnapshotRef.current && userSnapshotRef.current !== fingerprint) {
            getAccount()
        }

        // Update snapshot
        userSnapshotRef.current = fingerprint
    }, [
        account,
        session?.user?.id,
        session?.user?.username,
        session?.user?.name,
        session?.user?.description,
        session?.user?.richDescription,
        session?.user?.isVerified,
        session?.user?.isActive,
        session?.user?.profilePicture,
    ])

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

        console.log(moments)
        return new Date(maxTs)
    }, [moments])

    return (
        <FlatList
            data={normalizedMoments}
            numColumns={NUM_COLUMNS}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            columnWrapperStyle={{ justifyContent: "flex-start", marginBottom: SPACING }}
            contentContainerStyle={{ paddingHorizontal: SPACING, backgroundColor: "#000" }}
            keyExtractor={(item: any) => item.id}
            ListHeaderComponent={
                loading ? (
                    <View style={{ marginBottom: sizes.margins["1md"] }}>
                        <RenderProfileSkeleton />
                    </View>
                ) : user ? (
                    <ProfileHeader
                        isAccount={true}
                        user={user}
                        lastUpdateDate={lastCreatedAt ?? new Date()}
                        totalMoments={user.metrics.totalMomentsCreated}
                    />
                ) : (
                    <View style={{ marginBottom: sizes.margins["1md"] }}>
                        <RenderProfileSkeleton />
                    </View>
                )
            }
            renderItem={({ item }) => {
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
                            <DropDownMenuIOS onDelete={() => handleDeleteMoment(item.id)}>
                                <Pressable onPress={() => navigateToViewMoment(item.id)}>
                                    <Moment.Root.Main
                                        size={{
                                            ...sizes.moment.small,
                                            width: ITEM_SIZE,
                                            height: ITEM_SIZE * sizes.moment.aspectRatio,
                                            borderRadius: sizes.moment.small.borderRadius * 0.7,
                                        }}
                                        isFeed={false}
                                        isFocused={true}
                                        data={item}
                                        shadow={{ top: false, bottom: true }}
                                    >
                                        <Moment.Container
                                            contentRender={item.media}
                                            isFocused={true}
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
                            </DropDownMenuIOS>
                        </View>
                    )
            }}
            onEndReached={async () => {
                await handleLoadMore()
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="#888"
                    colors={["#888"]}
                />
            }
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
                            style={{ paddingVertical: sizes.paddings["1md"], alignItems: "center" }}
                        >
                            <NoMoments />
                        </View>
                    )
                } else if (!hasMoreMoments) {
                    return (
                        <View
                            style={{ paddingVertical: sizes.paddings["1md"], alignItems: "center" }}
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
