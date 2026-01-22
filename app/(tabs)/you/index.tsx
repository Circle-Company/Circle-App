import {
    FlatList,
    View,
    Dimensions,
    ActivityIndicator,
    Pressable,
    Text,
    RefreshControl,
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
import { NoMoments } from "@/features/profile/profile.no.moments"
import fonts from "@/constants/fonts"
import { NetworkContext } from "@/contexts/network"
import OfflineCard from "@/components/general/offline"
import { AccountMoment, AccountMomentsResponse } from "@/queries"

export default function AccountScreen() {
    const { account, moments, isLoadingAccount, isLoadingMoments, getAccount, getMoments } =
        React.useContext(AccountContext)
    const { session } = React.useContext(PersistedContext)
    const { networkStats } = React.useContext(NetworkContext)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMoreMoments, setHasMoreMoments] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const pageSize = 6
    const userSnapshotRef = useRef<string>("")

    const loading = isLoadingAccount || isLoadingMoments
    const { width } = Dimensions.get("window")
    const SPACING = 5
    const NUM_COLUMNS = 2
    const ITEM_SIZE = (width - (NUM_COLUMNS + 1) * SPACING) / NUM_COLUMNS
    const isOnline = networkStats === "ONLINE"

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

    useEffect(() => {
        // Initialize data on mount
        getAccount()
        getMoments({ page: 1, limit: pageSize })
    }, [])

    const handleRefresh = async () => {
        try {
            setRefreshing(true)
            // Reset to first page when refreshing
            setCurrentPage(1)
            setHasMoreMoments(true)
            await getAccount()
            await getMoments({ page: 1, limit: pageSize })
        } catch (error) {
            console.error("Error refreshing account data:", error)
        } finally {
            setRefreshing(false)
        }
    }

    const handleLoadMore = async () => {
        if (!isLoadingMoments && hasMoreMoments) {
            const nextPage = currentPage + 1
            const list = await getMoments({ page: nextPage, limit: pageSize })
            if (list && list.length > 0) {
                console.log(`📄 Loaded page ${nextPage}`)
                setCurrentPage(nextPage)
            } else {
                console.log("📭 No more moments to load")
                setHasMoreMoments(false)
            }
        }
    }

    function navigateToViewMoment(id: string) {
        router.navigate({ pathname: "/you/[id]", params: { id: String(id), from: "you" } })
    }

    const normalizedMoments = moments.map((moment: any) => {
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
            session.account.setMoments(moments)
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
                    <RenderProfileSkeleton />
                ) : user ? (
                    <ProfileHeader user={user} />
                ) : (
                    <RenderProfileSkeleton />
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
                            <Pressable onPress={() => navigateToViewMoment(item.id)}>
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
                                            <Moment.Description displayOnMoment={true} />
                                            <Moment.Date />
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
