import { ScrollView } from "react-native"
import React, { useState, useEffect } from "react"

import AccountContext from "@/contexts/account"
import PersistedContext from "@/contexts/Persisted"

import { AnimatedVerticalScrollView } from "@/lib/hooks/useAnimatedScrollView"
import { RenderProfileSkeleton } from "@/features/render-profile/skeleton"
import { useAccountQuery, useAccountMomentsQuery } from "@/state/queries"
import RenderProfile from "@/features/render-profile"
import { colors } from "@/constants/colors"
import { View } from "@/components/Themed"
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
                profilePicture: accountData.profilePicture,
            })

            // Update statistics
            session.metrics.set({
                totalFollowers: accountData.metrics.totalFollowers ?? 0,
                totalFollowing: accountData.metrics.totalFollowing ?? 0,
                totalLikesReceived: accountData.metrics.totalLikesReceived,
                totalViewsReceived: accountData.metrics.totalViewsReceived,
                followerGrowthRate30d: accountData.metrics.followerGrowthRate30d ?? 0,
                engagementGrowthRate30d: accountData.metrics.engagementGrowthRate30d ?? 0,
                interactionsGrowthRate30d: accountData.metrics.interactionsGrowthRate30d ?? 0,
            })
        }
    }, [accountData])

    useEffect(() => {
        if (momentsData) {
            session.account.setMoments(momentsData.moments)
            session.account.setTotalMoments(momentsData.pagination.total)
        }
    }, [momentsData])

    return (
        <ScrollView style={{ backgroundColor: "#000" }}>
            <AnimatedVerticalScrollView
                elasticEffect={true}
                onEndReachedThreshold={0.1}
                handleRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                endRefreshAnimationDelay={400}
                showRefreshSpinner={false}
                onScrollChange={setShowGradient}
                scrollThreshold={10}
            >
                {loading ? <RenderProfileSkeleton /> : <RenderProfile />}
                <View style={{ height: sizes.bottomTab.height * 0.5 }} />
            </AnimatedVerticalScrollView>
        </ScrollView>
    )
}
