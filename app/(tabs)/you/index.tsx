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
import {
    useAccountQuery,
    useAccountMomentsQuery,
    accountKeys,
    fetchAccountMoments,
} from "@/queries/account"
import { useQueryClient } from "@tanstack/react-query"

export default function AccountScreen() {
    // AccountContext fetch usage removed; using React Query hooks instead
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

    const queryClient = useQueryClient()
    const { data: accountData, isLoading: rqIsLoadingAccount } = useAccountQuery({
        enabled: !!session?.account?.jwtToken,
        staleTime: 1000 * 60 * 5,
        refetchOnMount: false,
    })
    const {
        data: momentsPage,
        isLoading: rqIsLoadingMoments,
        isFetching: isFetchingMoments,
    } = useAccountMomentsQuery(currentPage, 6, {
        enabled: !!session?.account?.jwtToken,
        staleTime: 1000 * 60 * 2,
        refetchOnMount: false,
    })
    const [accMoments, setAccMoments] = useState<any[]>([])
    const loading = rqIsLoadingAccount || isFetchingMoments
    const { width } = Dimensions.get("window")
    const SPACING = 5
    const NUM_COLUMNS = 2
    const ITEM_SIZE = (width - (NUM_COLUMNS + 1) * SPACING) / NUM_COLUMNS
    const isOnline = networkStats === "ONLINE"
    const navigation = useNavigation()

    const user = useMemo(() => {
        const acc = accountData
        if (!acc || !acc.id) return null
        return {
            id: Number(acc.id),
            username: acc.username,
            name: acc.name ?? null,
            description: acc.description ?? null,
            profilePicture: acc.profilePicture ?? null,
            status: { verified: !!acc.status?.verified },
            metrics: {
                totalMomentsCreated:
                    typeof session.account.totalMoments === "number"
                        ? session.account.totalMoments
                        : (accMoments?.length ?? 0),
                totalFollowers: acc.metrics?.totalFollowers ?? 0,
            },
            interactions: {
                isFollowing: false,
                isFollowedBy: false,
                isBlockedBy: false,
                isBlocking: false,
            },
        }
    }, [accountData, session.account.totalMoments, accMoments])

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
        if (!momentsPage) return
        const page = momentsPage.pagination?.page ?? currentPage
        const incoming = momentsPage.moments ?? []
        if (page <= 1) {
            setAccMoments(incoming)
        } else {
            setAccMoments((prev) => {
                const seen = new Set(prev.map((m: any) => String(m?.id)))
                const add = incoming.filter((m: any) => !seen.has(String(m?.id)))
                return [...prev, ...add]
            })
        }
        if (momentsPage.pagination) {
            const { page: p, totalPages } = momentsPage.pagination
            setHasMoreMoments(p < totalPages)
        }
    }, [momentsPage])

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

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: accountKeys.detail() }),
                queryClient.invalidateQueries({ queryKey: accountKeys.moments() }),
            ])
            setAccMoments([])
        } catch (error) {
            console.error("Error refreshing account data:", error)
        } finally {
            setRefreshing(false)
            refreshInProgressRef.current = false
        }
    }

    const handleLoadMore = async () => {
        // Block if loading or no more items or refreshing
        if (loadingMoreRef.current || isFetchingMoments || refreshing || !hasMoreMoments) return

        const nextPage = currentPage + 1
        // Prevent duplicate same-page requests caused by repeated onEndReached
        if (lastRequestedPageRef.current === nextPage) return

        loadingMoreRef.current = true
        lastRequestedPageRef.current = nextPage
        try {
            // Prefetch next page into cache; accumulator updates when query data arrives
            await queryClient.prefetchQuery({
                queryKey: accountKeys.momentsPaginated(nextPage, 6),
                queryFn: () => fetchAccountMoments(nextPage, 6),
                staleTime: 1000 * 60 * 2,
            })
            console.log(`📄 Prefetched page ${nextPage}`)
            setCurrentPage(nextPage)
        } catch (e) {
            console.error("Error prefetching more moments:", e)
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
            setAccMoments([])
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: accountKeys.detail() }),
                queryClient.invalidateQueries({ queryKey: accountKeys.moments() }),
            ])
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

    const normalizedMoments = (accMoments ?? []).map((moment: any) => {
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

    // Sync Persisted session when query data changes
    useEffect(() => {
        if (accountData) {
            session.user.set({
                id: accountData.id,
                username: accountData.username,
                name: accountData.name,
                description: accountData.description,
                richDescription: accountData.description,
                isVerified: !!accountData.status?.verified,
                isActive: session.user.isActive,
                profilePicture: accountData.profilePicture,
            })

            session.metrics.set({
                totalFollowers: accountData.metrics?.totalFollowers ?? 0,
                totalFollowing: accountData.metrics?.totalFollowing ?? 0,
                totalLikesReceived: accountData.metrics?.totalLikesReceived ?? 0,
                totalViewsReceived: accountData.metrics?.totalViewsReceived ?? 0,
                followerGrowthRate30d: accountData.metrics?.followerGrowthRate30d ?? 0,
                engagementGrowthRate30d: accountData.metrics?.engagementGrowthRate30d ?? 0,
                interactionsGrowthRate30d: accountData.metrics?.interactionsGrowthRate30d ?? 0,
            })
            if (
                typeof session.account.totalMoments !== "number" ||
                session.account.totalMoments === 0
            ) {
                session.account.setTotalMoments(accMoments?.length ?? 0)
            }
        }
    }, [accountData, accMoments])

    useEffect(() => {
        if (Array.isArray(accMoments)) {
            session.account.setMoments(accMoments as any)
            if (
                typeof session.account.totalMoments !== "number" ||
                session.account.totalMoments === 0
            ) {
                session.account.setTotalMoments(accMoments.length)
            }
        }
    }, [accMoments])

    // Snapshot session.user fields; if any field changes compared to the last snapshot, refetch account
    useEffect(() => {
        if (!accountData) return

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
            queryClient.invalidateQueries({ queryKey: accountKeys.detail() })
        }

        // Update snapshot
        userSnapshotRef.current = fingerprint
    }, [
        accountData,
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
        if (!Array.isArray(accMoments) || accMoments.length === 0) return undefined
        const getDate = (m: any) =>
            m?.publishedAt || m?.createdAt || m?.created_at || m?.date || m?.timestamp
        const timestamps = accMoments
            .map((m: any) => {
                const d = getDate(m)
                const ts = d ? new Date(d as any).getTime() : NaN
                return ts
            })
            .filter((ts: number) => Number.isFinite(ts))
        if (timestamps.length === 0) return undefined
        const maxTs = Math.max(...timestamps)

        console.log(accMoments)
        return new Date(maxTs)
    }, [accMoments])

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
                if (isFetchingMoments) {
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
                } else if (!rqIsLoadingMoments && !isFetchingMoments && accMoments.length === 0) {
                    return (
                        <View
                            style={{ paddingVertical: sizes.paddings["1md"], alignItems: "center" }}
                        >
                            <NoMoments />
                        </View>
                    )
                } else if (!hasMoreMoments && accMoments.length > 0) {
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
