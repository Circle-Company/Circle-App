import React from "react"
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native"
import { usePushNotifications } from "@/contexts/push.notification"
import { colors } from "@/constants/colors"

export default function InboxScreen() {
    const {
        notifications,
        notificationsLoading,
        notificationsRefreshing,
        hasNextNotifications,
        fetchNextNotifications,
        refetchNotifications,
    } = usePushNotifications()

    const items: any[] = React.useMemo(() => {
        return notifications ?? []
    }, [notifications])

    const onRefresh = React.useCallback(() => {
        refetchNotifications()
    }, [refetchNotifications])

    const onEndReached = React.useCallback(() => {
        if (!items || items.length === 0) return
        if (!hasNextNotifications) return
        fetchNextNotifications()
    }, [items, hasNextNotifications, fetchNextNotifications])

    if (notificationsLoading && !notificationsRefreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator style={{ width: 50, height: 50 }} />
            </View>
        )
    }

    return (
        <FlatList
            data={items}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            renderItem={() => <View style={styles.itemPlaceholder} />}
            contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
            ListEmptyComponent={
                <View style={styles.center}>
                    <ActivityIndicator style={{ width: 50, height: 50 }} />
                </View>
            }
            refreshControl={
                <RefreshControl
                    refreshing={notificationsRefreshing}
                    onRefresh={onRefresh}
                    tintColor="#999"
                />
            }
            onEndReachedThreshold={0.1}
            onEndReached={onEndReached}
        />
    )
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.gray.black,
    },
    emptyContainer: {
        flexGrow: 1,
        justifyContent: "center",
        backgroundColor: colors.gray.black,
    },
    itemPlaceholder: {
        height: 72,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#2a2a2a",
        backgroundColor: colors.gray.black,
    },
})
