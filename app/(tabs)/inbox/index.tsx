import React, { useCallback, useMemo, useState, useEffect, useRef } from "react"
import {
    View,
    ViewStyle,
    ActivityIndicator,
    SectionList,
    RefreshControl,
    Animated,
} from "react-native"
import { Text } from "@/components/Themed"
import NotificationItem from "@/components/notification/notification.item"
import { NotificationSkeleton } from "@/components/notification/notification.skeleton"
import { NotificationEmptyCard } from "@/components/notification/notification.empty.card"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import { usePushNotifications } from "@/contexts/push.notification"
import { useDateHelpers, TimeInterval } from "@/lib/hooks/separeArrByDate"
import type { NotificationPayload } from "@/contexts/push.notification"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { Pressable } from "react-native"
import { router } from "expo-router"

/**
 * Given how far a notification is from now (in ms), picks the best
 * TimeInterval so the label reads naturally.
 */
function pickIntervalFromAge(ageMs: number): TimeInterval {
    const m = ageMs / 60000
    if (m < 1) return TimeInterval.SECOND
    if (m < 60) return TimeInterval.MINUTE
    if (m < 60 * 24) return TimeInterval.HOUR
    if (m < 60 * 24 * 7) return TimeInterval.DAY
    if (m < 60 * 24 * 30) return TimeInterval.WEEK
    if (m < 60 * 24 * 30 * 3) return TimeInterval.MONTH
    if (m < 60 * 24 * 365) return TimeInterval.TRIMESTER
    return TimeInterval.YEAR
}

// grouping handled in component using useDateHelpers

export default function InboxScreen() {
    const {
        notifications,
        notificationsLoading,
        notificationsRefreshing,
        hasNextNotifications,
        fetchNextNotifications,
        refetchNotifications,
        error,
    } = usePushNotifications()
    const { t } = React.useContext(LanguageContext)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const { getDateStringRelative } = useDateHelpers()

    const container: ViewStyle = useMemo(
        () => ({
            flex: 1,
            backgroundColor: colors.gray.black,
        }),
        [],
    )

    const sections = useMemo(() => {
        if (!notifications.length) return []

        const now = Date.now()

        // Ordena por data decrescente (mais recente primeiro)
        const sorted = [...notifications]
            .filter((n) => n.createdAt && !Number.isNaN(new Date(n.createdAt).getTime()))
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())

        if (!sorted.length) return []

        // Para cada notificação, gera um label baseado na distância até agora
        const labeled = sorted.map((n) => {
            const date = new Date(n.createdAt!)
            const ageMs = now - date.getTime()
            const interval = pickIntervalFromAge(ageMs)
            return { n, label: getDateStringRelative(date, interval) }
        })

        // Agrupa por label mantendo ordem, sem colapsar seções com mesmo nome em posições diferentes
        const result: { title: string; data: NotificationPayload[] }[] = []
        let currentLabel = labeled[0].label
        let currentSection: NotificationPayload[] = [labeled[0].n]

        for (let i = 1; i < labeled.length; i++) {
            const { n, label } = labeled[i]
            if (label === currentLabel) {
                currentSection.push(n)
            } else {
                result.push({ title: currentLabel, data: currentSection })
                currentLabel = label
                currentSection = [n]
            }
        }
        result.push({ title: currentLabel, data: currentSection })

        return result
    }, [notifications, getDateStringRelative])

    const headerStyle: ViewStyle = {
        paddingTop: sizes.paddings["2sm"],
        paddingBottom: sizes.paddings["1sm"],
        paddingLeft: sizes.paddings["2sm"],
    }

    const handleRefresh = useCallback(async () => {
        await refetchNotifications()
    }, [refetchNotifications])

    const [noMoreNotifications, setNoMoreNotifications] = useState(false)

    const handleLoadMore = useCallback(async () => {
        if (!hasNextNotifications || notificationsLoading || isLoadingMore || noMoreNotifications)
            return
        setIsLoadingMore(true)
        const startedAt = Date.now()
        try {
            const prevCount = notifications.length
            await fetchNextNotifications()
            // If count didn't increase, mark as finished
            if (notifications.length === prevCount) {
                setNoMoreNotifications(true)
            }
        } finally {
            const elapsed = Date.now() - startedAt
            const remaining = 1500 - elapsed
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining))
            }
            setIsLoadingMore(false)
        }
    }, [
        hasNextNotifications,
        notificationsLoading,
        isLoadingMore,
        fetchNextNotifications,
        notifications,
        noMoreNotifications,
    ])

    const showFooter = isLoadingMore && notifications.length > 0

    const [showSkeleton, setShowSkeleton] = useState(false)
    const skeletonOpacity = useRef(new Animated.Value(1)).current
    const skeletonShownAt = useRef<number | null>(null)

    useEffect(() => {
        if (notificationsLoading && notifications.length === 0) {
            skeletonShownAt.current = Date.now()
            setShowSkeleton(true)
            skeletonOpacity.setValue(1)
            return
        }

        if (!showSkeleton) return

        const elapsed = skeletonShownAt.current ? Date.now() - skeletonShownAt.current : 1000
        const remaining = Math.max(1000 - elapsed, 0)

        const timeout = setTimeout(() => {
            Animated.timing(skeletonOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setShowSkeleton(false)
                skeletonOpacity.setValue(1)
            })
        }, remaining)

        return () => clearTimeout(timeout)
    }, [notificationsLoading, notifications.length, showSkeleton, skeletonOpacity])

    const emptyOpacity = useRef(new Animated.Value(1)).current

    useEffect(() => {
        Animated.timing(emptyOpacity, {
            toValue: notificationsRefreshing ? 0 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }, [notificationsRefreshing, emptyOpacity])

    if (error) {
        return (
            <View style={container}>
                <Text style={{ color: colors.gray.white, padding: 16 }}>
                    Erro ao carregar notificações
                </Text>
            </View>
        )
    }

    if (showSkeleton) {
        return (
            <View style={container}>
                <Animated.View style={{ opacity: skeletonOpacity }}>
                    <View
                        style={{
                            paddingTop: sizes.headers.height * 1.45,
                            paddingHorizontal: sizes.margins["1md"],
                            gap: sizes.paddings["1sm"],
                        }}
                    >
                        <NotificationSkeleton opacity={1} />
                        <NotificationSkeleton opacity={0.8} />
                        <NotificationSkeleton opacity={0.6} />
                        <NotificationSkeleton opacity={0.4} />
                        <NotificationSkeleton opacity={0.2} />
                    </View>
                </Animated.View>
            </View>
        )
    }

    return (
        <View style={container}>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <NotificationItem item={item} />}
                renderSectionHeader={({ section }) => (
                    <View style={headerStyle}>
                        <Text
                            style={{
                                color: colors.gray.grey_04,
                                fontSize: 12,
                                textTransform: "uppercase",
                                fontFamily: fonts.family.Bold,
                            }}
                        >
                            {section.title}
                        </Text>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={{ height: sizes.margins["2sm"] }} />}
                ListHeaderComponent={<View style={{ height: sizes.headers.height * 1.3 }} />}
                ListEmptyComponent={
                    <Animated.View
                        style={{ opacity: emptyOpacity, marginTop: sizes.headers.height * 0.2 }}
                        pointerEvents={notificationsRefreshing ? "none" : "auto"}
                    >
                        <NotificationEmptyCard />
                    </Animated.View>
                }
                ListFooterComponent={
                    showFooter ? (
                        <View
                            style={{
                                paddingTop: sizes.paddings["1md"],
                                width: sizes.screens.width - sizes.margins["1md"] * 2,
                                marginBottom: sizes.screens.height * 0.2,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ActivityIndicator color={colors.gray.grey_04} />
                        </View>
                    ) : (
                        <View
                            style={{
                                paddingTop: sizes.paddings["1md"],
                                width: sizes.screens.width - sizes.margins["1md"] * 2,
                                marginBottom: sizes.screens.height * 0.2,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: fonts.family["Medium-Italic"],
                                    fontSize: fonts.size.body,
                                    color: colors.gray.grey_04,
                                }}
                            >
                                {t("No more notifications")}
                            </Text>
                        </View>
                    )
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                refreshing={notificationsRefreshing}
                refreshControl={
                    <RefreshControl
                        refreshing={notificationsRefreshing}
                        onRefresh={() => {
                            setNoMoreNotifications(false)
                            handleRefresh()
                        }}
                        tintColor={colors.gray.grey_04}
                        colors={[colors.gray.grey_04]}
                        progressViewOffset={sizes.headers.height * 1.45}
                    />
                }
                contentContainerStyle={{
                    marginHorizontal: sizes.margins["1md"],
                    flexGrow: 1,
                }}
                style={{ flex: 1 }}
                scrollEnabled={true}
                alwaysBounceVertical={true}
                bounces={true}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}
