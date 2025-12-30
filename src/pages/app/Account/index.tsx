import { ScrollView } from "react-native"
import React, { useState, useEffect } from "react"

import AccountContext from "@/contexts/account"
import PersistedContext from "@/contexts/Persisted"

import { AnimatedVerticalScrollView } from "@/lib/hooks/useAnimatedScrollView"
import { RenderProfileSkeleton } from "@/features/profile/profile.skeleton"

import RenderProfile from "@/features/profile"

import { View } from "@/components/Themed"
import sizes from "@/constants/sizes"

export default function AccountScreen() {
    const { account, moments, isLoadingAccount, isLoadingMoments, getAccount, getMoments } =
        React.useContext(AccountContext)
    const { session } = React.useContext(PersistedContext)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMoreMoments, setHasMoreMoments] = useState(true)
    const [showGradient, setShowGradient] = useState(false)

    const pageSize = 20

    const loading = isLoadingAccount || isLoadingMoments

    useEffect(() => {
        // Initialize data on mount
        getAccount()
        getMoments({ page: 1, limit: pageSize })
    }, [])

    const handleRefresh = async () => {
        try {
            // Reset to first page when refreshing
            setCurrentPage(1)
            setHasMoreMoments(true)
            await getAccount()
            await getMoments({ page: 1, limit: pageSize })
        } catch (error) {
            console.error("Error refreshing account data:", error)
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

    // Sync Persisted session when context data changes
    useEffect(() => {
        if (account) {
            session.user.set({
                id: account.id,
                username: account.username,
                name: account.name,
                description: account.description,
                richDescription: account.description,
                isVerified: account.status.verified,
                profilePicture: account.profilePicture,
            })

            session.metrics.set({
                totalFollowers: account.metrics.totalFollowers ?? 0,
                totalFollowing: account.metrics.totalFollowing ?? 0,
                totalLikesReceived: account.metrics.totalLikesReceived ?? 0,
                totalViewsReceived: account.metrics.totalViewsReceived ?? 0,
                followerGrowthRate30d: account.metrics.followerGrowthRate30d ?? 0,
                engagementGrowthRate30d: account.metrics.engagementGrowthRate30d ?? 0,
                interactionsGrowthRate30d: account.metrics.interactionsGrowthRate30d ?? 0,
            })
            if (typeof account.metrics.totalMomentsCreated === "number") {
                session.account.setTotalMoments(account.metrics.totalMomentsCreated)
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
