import React from "react"
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    TextStyle,
    View,
    ViewStyle,
} from "react-native"

import { Text } from "@/components/Themed"
import { NotificationSkeleton } from "@/components/notification/notification.skeleton"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { usePushNotifications, NotificationType } from "@/contexts/push.notification"
import { useFriendRequestsQuery } from "@/queries/friendship"
import type { UserSummary } from "@/queries/user"
import { InviteItem } from "./invite.item"

/**
 * Caixa de convites recebidos. A API devolve só o `userId` de cada convite, mas
 * a notificação `FRIEND_REQUEST_RECEIVED` correspondente já traz nome e foto do
 * remetente — usamos esse mapa como dado imediato enquanto `GET /users/:id`
 * responde, para a linha não nascer vazia.
 */
export function InvitesList() {
    const { t } = React.useContext(LanguageContext)
    const { notifications } = usePushNotifications()
    const { data, isLoading, isRefetching, refetch } = useFriendRequestsQuery("incoming")

    const placeholders = React.useMemo(() => {
        const map = new Map<string, UserSummary>()
        for (const n of notifications) {
            if (n.type !== NotificationType.FriendRequestReceived) continue
            const id = String(n.actor?.id || "")
            if (!id || map.has(id)) continue
            map.set(id, {
                id,
                username: String(n.actor?.username || ""),
                name: n.actor?.name ? String(n.actor.name) : null,
                profilePicture: String(n.actor?.profilePicture || ""),
                verified: false,
                areFriends: false,
                friendshipStatus: "pending_incoming",
            })
        }
        return map
    }, [notifications])

    const invites = data?.invites ?? []

    const emptyContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["1lg"] * 0.9,
        borderRadius: sizes.borderRadius["1lg"] * 1.4,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1md"],
    }

    const emptyTitle: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family.Bold,
        fontStyle: "italic",
        marginBottom: sizes.margins["2sm"],
        textAlign: "center",
    }

    const emptyDescription: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        textAlign: "center",
    }

    if (isLoading && invites.length === 0) {
        return (
            <View
                style={{
                    paddingTop: sizes.paddings["1md"],
                    paddingHorizontal: sizes.margins["1md"],
                    gap: sizes.paddings["1sm"],
                }}
            >
                <NotificationSkeleton opacity={1} />
                <NotificationSkeleton opacity={0.7} />
                <NotificationSkeleton opacity={0.4} />
            </View>
        )
    }

    return (
        <FlatList
            data={invites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <InviteItem invite={item} placeholder={placeholders.get(String(item.userId))} />
            )}
            ItemSeparatorComponent={() => <View style={{ height: sizes.margins["2sm"] }} />}
            ListHeaderComponent={<View style={{ height: sizes.paddings["1md"] }} />}
            ListEmptyComponent={
                <View style={emptyContainer}>
                    <Text style={emptyTitle}>{t("No pending invites")} 🤝</Text>
                    <Text style={emptyDescription}>
                        {t("When someone invites you to be their friend, it shows up here.")}
                    </Text>
                </View>
            }
            refreshControl={
                <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    tintColor={colors.gray.grey_04}
                    colors={[colors.gray.grey_04]}
                />
            }
            contentContainerStyle={{ marginHorizontal: sizes.margins["1md"], flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
        />
    )
}

export default InvitesList
