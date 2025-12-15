import AccountContext from "../../../contexts/account"
import { AnimatedVerticalScrollView } from "../../../lib/hooks/useAnimatedScrollView"
import CircleIcon from "@/assets/icons/svgs/circle-spinner.svg"
import PersistedContext from "../../../contexts/Persisted"
import React, { useState, useEffect } from "react"
import RenderProfile from "../../../features/render-profile"
import { RenderProfileSkeleton } from "../../../features/render-profile/skeleton"
import { View } from "../../../components/Themed"
import { colors } from "../../../constants/colors"
import { useAccountQuery, useAccountMomentsQuery } from "../../../state/queries"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import sizes from "@/constants/sizes"

export default function AccountScreen() {
    const { setRefreshing } = React.useContext(AccountContext)
    const { session } = React.useContext(PersistedContext)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMoreMoments, setHasMoreMoments] = useState(true)
    const [showGradient, setShowGradient] = useState(false)

    // TanStack Query hooks
    const {
        data: accountData,
        isLoading: isLoadingAccount,
        refetch: refetchAccount,
        isFetching: isFetchingAccount,
    } = useAccountQuery(session.account.jwtToken, {
        enabled: !!session.account.jwtToken,
        refetchOnMount: true,
    })

    const {
        data: momentsData,
        isLoading: isLoadingMoments,
        refetch: refetchMoments,
    } = useAccountMomentsQuery(session.account.jwtToken, currentPage, 20, {
        enabled: !!session.account.jwtToken,
        refetchOnMount: true,
    })

    const loading = isLoadingAccount || isLoadingMoments

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            // Reset to first page when refreshing
            setCurrentPage(1)
            setHasMoreMoments(true)
            await Promise.all([refetchAccount(), refetchMoments()])
        } catch (error) {
            console.error("Error refreshing account data:", error)
        } finally {
            setRefreshing(false)
        }
    }

    const handleLoadMore = async () => {
        if (momentsData && !isLoadingMoments && hasMoreMoments) {
            const { pagination } = momentsData
            if (pagination.page < pagination.totalPages) {
                console.log(`📄 Loading page ${currentPage + 1}`)
                setCurrentPage((prev) => prev + 1)
            } else {
                console.log("📭 No more moments to load")
                setHasMoreMoments(false)
            }
        }
    }

    // Update persisted context when query data arrives
    useEffect(() => {
        if (accountData) {
            console.log("✅ Account data loaded, updating session:", accountData)

            // Update user data
            session.user.set({
                id: accountData.id,
                username: accountData.username,
                name: accountData.name,
                description: accountData.description,
                richDescription: accountData.description,
                isVerified: accountData.status.verified,
                isActive: true,
                profilePicture: accountData.profilePicture,
            })

            // Update statistics
            session.statistics.set({
                total_followers_num: 104,
                total_likes_num: accountData.metrics.totalLikesReceived,
                total_views_num: accountData.metrics.totalViewsReceived,
            })
        }
    }, [accountData])

    useEffect(() => {
        if (momentsData) {
            // Save moments and total to persisted account
            session.account.setMoments(momentsData.moments)
            session.account.setTotalMoments(momentsData.pagination.total)
        }
    }, [momentsData])

    return (
        <View style={{ flex: 1, position: "relative" }}>
            <AnimatedVerticalScrollView
                elasticEffect={false}
                onEndReachedThreshold={0.1}
                handleRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                endRefreshAnimationDelay={400}
                showRefreshSpinner={false}
                CustomRefreshIcon={() => (
                    <CircleIcon width={26} height={26} fill={colors.gray.grey_06} />
                )}
                onScrollChange={setShowGradient}
                scrollThreshold={10}
            >
                {loading ? <RenderProfileSkeleton /> : <RenderProfile />}
                <View style={{ height: sizes.bottomTab.height * 0.5 }} />
            </AnimatedVerticalScrollView>

            {/* Gradiente animado que aparece com scroll */}
            {showGradient && (
                <Animated.View
                    entering={FadeIn.duration(100)}
                    exiting={FadeOut.duration(300)}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 40,
                        zIndex: 1000,
                        pointerEvents: "none",
                    }}
                >
                    <LinearGradient
                        colors={["rgba(0, 0, 0, 1)", "rgba(0, 0, 0, 0)"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    />
                </Animated.View>
            )}
        </View>
    )
}
