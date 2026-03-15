import React, { useCallback, useMemo, useState, useContext } from "react"
import {
    View,
    ViewStyle,
    ActivityIndicator,
    Pressable,
    SectionList,
    RefreshControl,
} from "react-native"
import { Text } from "@/components/Themed"
import NotificationItem from "@/components/notification/notification.item"
import { NotificationSkeleton } from "@/components/notification/notification.skeleton"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import { usePushNotifications } from "@/contexts/push.notification"
import LanguageContext from "@/contexts/language"
import type { NotificationPayload } from "@/contexts/push.notification"

type Section = {
    title: string
    data: NotificationPayload[]
}

type TranslateFn = (key: string) => string

export enum TimeInterval {
    SECOND = 1000,
    MINUTE = 60 * 1000,
    HOUR = 60 * 60 * 1000,
    DAY = 24 * 60 * 60 * 1000,
    WEEK = 7 * 24 * 60 * 60 * 1000,
    BIMONTH = 2 * 30 * 24 * 60 * 60 * 1000,
    MONTH = 30 * 24 * 60 * 60 * 1000,
    TRIMESTER = 3 * 30 * 24 * 60 * 60 * 1000,
    SEMESTER = 6 * 30 * 24 * 60 * 60 * 1000,
    YEAR = 365 * 24 * 60 * 60 * 1000,
}

const DEFAULT_TIME_INTERVAL = TimeInterval.DAY

function getMostRecentDate(notifications: NotificationPayload[]): Date | null {
    let mostRecent: Date | null = null
    for (const item of notifications) {
        if (!item.createdAt) continue
        const date = new Date(item.createdAt)
        if (Number.isNaN(date.getTime())) continue
        if (!mostRecent || date.getTime() > mostRecent.getTime()) {
            mostRecent = date
        }
    }
    return mostRecent
}

function getIntervalFromMostRecent(notifications: NotificationPayload[]): TimeInterval {
    const mostRecent = getMostRecentDate(notifications)
    if (!mostRecent) return DEFAULT_TIME_INTERVAL

    const now = new Date()
    const diff = now.getTime() - mostRecent.getTime()

    if (diff <= TimeInterval.WEEK) return TimeInterval.WEEK
    if (diff <= TimeInterval.MONTH) return TimeInterval.MONTH
    if (diff <= TimeInterval.TRIMESTER) return TimeInterval.TRIMESTER
    if (diff <= TimeInterval.SEMESTER) return TimeInterval.SEMESTER
    if (diff <= TimeInterval.YEAR) return TimeInterval.YEAR

    return TimeInterval.YEAR
}

function groupNotifications(
    notifications: NotificationPayload[],
    t: TranslateFn,
    timeInterval: TimeInterval = DEFAULT_TIME_INTERVAL,
): Section[] {
    const map = new Map<string, NotificationPayload[]>()

    for (const item of notifications) {
        if (!item.createdAt) continue
        const date = new Date(item.createdAt)
        if (Number.isNaN(date.getTime())) continue

        const title = getDateStringRelative(date, t, timeInterval)
        if (!map.has(title)) map.set(title, [])
        map.get(title)?.push(item)
    }

    return Array.from(map.entries()).map(([title, data]) => ({
        title,
        data,
    }))
}

function getDateStringRelative(date: Date, t: TranslateFn, timeInterval: TimeInterval): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (timeInterval === TimeInterval.SECOND) {
        const secondsAgo = Math.floor(diff / timeInterval)
        return secondsAgo === 0
            ? t("now")
            : `${secondsAgo} ${secondsAgo === 1 ? t("second") : t("seconds")} ${t("ago")}`
    } else if (timeInterval === TimeInterval.MINUTE) {
        const minutesAgo = Math.floor(diff / timeInterval)
        return minutesAgo === 0
            ? t("now")
            : `${minutesAgo} ${minutesAgo === 1 ? t("minute") : t("minutes")} ${t("ago")}`
    } else if (timeInterval === TimeInterval.HOUR) {
        const hoursAgo = Math.floor(diff / timeInterval)
        return hoursAgo === 0
            ? t("now")
            : `${hoursAgo} ${hoursAgo === 1 ? t("hour") : t("hours")} ${t("ago")}`
    } else if (timeInterval === TimeInterval.DAY) {
        const daysAgo = Math.floor(diff / timeInterval)
        return getDayString(daysAgo, t)
    } else if (timeInterval === TimeInterval.WEEK) {
        const weeksAgo = Math.floor(diff / timeInterval)
        return weeksAgo === 0
            ? t("this week")
            : weeksAgo === 1
              ? t("last week")
              : `${weeksAgo} ${t("weeks ago")}`
    } else if (timeInterval === TimeInterval.BIMONTH) {
        const bimonthsAgo = Math.floor(diff / timeInterval)
        return bimonthsAgo === 0
            ? t("this two months")
            : bimonthsAgo === 1
              ? t("last two months")
              : `${bimonthsAgo} ${t("two months ago")}`
    } else if (timeInterval === TimeInterval.MONTH) {
        const monthsAgo = Math.floor(diff / timeInterval)
        return monthsAgo === 0
            ? t("this month")
            : monthsAgo === 1
              ? t("last month")
              : `${monthsAgo} ${t("months ago")}`
    } else if (timeInterval === TimeInterval.TRIMESTER) {
        const trimestersAgo = Math.floor(diff / timeInterval)
        return trimestersAgo === 0
            ? t("this quarter")
            : trimestersAgo === 1
              ? t("last quarter")
              : `${trimestersAgo} ${t("quarters ago")}`
    } else if (timeInterval === TimeInterval.SEMESTER) {
        const semestersAgo = Math.floor(diff / timeInterval)
        return semestersAgo === 0
            ? t("this semester")
            : semestersAgo === 1
              ? t("last semester")
              : `${semestersAgo} ${t("semesters ago")}`
    } else if (timeInterval === TimeInterval.YEAR) {
        const currentYear = now.getFullYear()
        const objYear = date.getFullYear()

        if (currentYear === objYear) return t("this year")
        const yearsAgo = Math.floor(diff / timeInterval)
        return yearsAgo === 1 ? t("last year") : `${yearsAgo} ${t("years ago")}`
    }

    return t("more than a year ago")
}

function getDayString(daysAgo: number, t: TranslateFn): string {
    if (daysAgo === 0) return t("today")
    if (daysAgo === 1) return t("yesterday")
    return `${daysAgo} ${t("days ago")}`
}

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

    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const { t } = useContext(LanguageContext)

    const container: ViewStyle = useMemo(
        () => ({
            flex: 1,
            backgroundColor: colors.gray.black,
        }),
        [],
    )

    const sections = useMemo(() => {
        const interval = getIntervalFromMostRecent(notifications)
        return groupNotifications(notifications, t, interval)
    }, [notifications, t])

    const headerStyle: ViewStyle = {
        paddingTop: sizes.paddings["1sm"],
        paddingBottom: sizes.paddings["1sm"],
    }

    const handleRefresh = useCallback(async () => {
        await refetchNotifications()
    }, [refetchNotifications])

    const handleLoadMore = useCallback(async () => {
        if (!hasNextNotifications || notificationsLoading || isLoadingMore) return
        setIsLoadingMore(true)
        const startedAt = Date.now()
        try {
            await fetchNextNotifications()
        } finally {
            const elapsed = Date.now() - startedAt
            const remaining = 1500 - elapsed
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining))
            }
            setIsLoadingMore(false)
        }
    }, [hasNextNotifications, notificationsLoading, isLoadingMore, fetchNextNotifications])

    const showFooter = isLoadingMore && notifications.length > 0

    if (error) {
        return (
            <View style={container}>
                <Text style={{ color: colors.gray.white, padding: 16 }}>
                    Erro ao carregar notificações
                </Text>
            </View>
        )
    }

    if (notificationsLoading) {
        return (
            <View style={container}>
                <View
                    style={{
                        paddingTop: sizes.headers.height * 1.45,
                        paddingHorizontal: sizes.margins["1md"],
                        gap: sizes.paddings["1sm"],
                    }}
                >
                    <NotificationSkeleton />
                    <NotificationSkeleton />
                    <NotificationSkeleton />
                    <NotificationSkeleton />
                    <NotificationSkeleton />
                </View>
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
                            }}
                        >
                            {section.title}
                        </Text>
                    </View>
                )}
                ListHeaderComponent={<View style={{ height: sizes.headers.height * 1.45 }} />}
                ListEmptyComponent={
                    <Text style={{ color: colors.gray.white, padding: 16 }}>
                        <Pressable onPress={handleRefresh}>
                            <Text>Nenhuma notificação</Text>
                        </Pressable>
                    </Text>
                }
                ListFooterComponent={
                    showFooter ? (
                        <View style={{ paddingVertical: 16 }}>
                            <ActivityIndicator color={colors.gray.grey_04} />
                        </View>
                    ) : null
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshing={notificationsRefreshing}
                onRefresh={handleRefresh}
                refreshControl={
                    <RefreshControl
                        refreshing={notificationsRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.gray.grey_04}
                        colors={[colors.gray.grey_04]}
                        progressViewOffset={sizes.headers.height * 1.45}
                    />
                }
                contentContainerStyle={{
                    paddingBottom: 24,
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
