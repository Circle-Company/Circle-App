import React from "react"
import { Alert, FlatList, RefreshControl, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Themed"
import { UserShow } from "@/components/user_show"
import Button from "@/components/buttons/button-standart"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { useFriendsQuery, useRemoveFriendMutation, type Friend } from "@/queries/friendship"

/**
 * Gerenciamento de amigos da própria conta: lista quem já é amigo e permite
 * desfazer a amizade. A remoção é silenciosa — o outro lado não é notificado.
 */
export default function FriendsScreen() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const accountId = String(session?.user?.id || "")

    // 200 é o teto da API por página. Acima disso a tela precisaria paginar;
    // `total` continua sendo a contagem real, então o contador não mente.
    const { data, isLoading, isRefetching, refetch } = useFriendsQuery(accountId, 200, 0)
    const friends = data?.friends ?? []
    const total = data?.total ?? friends.length

    const container: ViewStyle = {
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        flex: 1,
    }

    const emptyContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["1lg"] * 0.8,
        borderRadius: sizes.borderRadius["1lg"] * 1.2,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
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
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
    }

    const counterText: TextStyle = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.caption1,
        color: colors.gray.grey_04,
        textTransform: "uppercase",
        marginBottom: sizes.margins["2sm"],
        marginLeft: sizes.margins["1sm"],
    }

    return (
        <FlatList
            style={container}
            data={friends}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    tintColor="#888"
                    colors={["#888"]}
                />
            }
            ListHeaderComponent={
                total > 0 ? (
                    <Text style={counterText}>
                        {total} {total === 1 ? t("Friend") : t("Friends")}
                    </Text>
                ) : null
            }
            renderItem={({ item }) => <FriendRow item={item} onRefetch={refetch} />}
            ListEmptyComponent={() => {
                if (isLoading) return null
                return (
                    <View style={emptyContainer}>
                        <Text style={emptyTitle}>{t("You have no friends yet")} 🤝</Text>
                        <Text style={emptyDescription}>
                            {t(
                                "Invite people you know to be your friend and they will show up here.",
                            )}
                        </Text>
                    </View>
                )
            }}
        />
    )
}

function FriendRow({ item, onRefetch }: { item: Friend; onRefetch: () => void }) {
    const { t } = React.useContext(LanguageContext)
    const removeMutation = useRemoveFriendMutation({ userId: item.id })

    const itemContainer: ViewStyle = {
        width: "100%",
        alignSelf: "flex-start",
        alignItems: "flex-start",
        justifyContent: "center",
        flexDirection: "row",
        marginBottom: sizes.margins["1md"] * 0.5,
        paddingVertical: sizes.paddings["2sm"],
        paddingHorizontal: sizes.paddings["1sm"],
        borderRadius: sizes.borderRadius["1md"] * 1.2,
        backgroundColor: colors.gray.grey_09,
    }

    const buttonText: TextStyle = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.body,
        color: colors.gray.grey_01,
    }

    // `UserShow` espera `profilePicture`; a API de amigos devolve
    // `profilePictureUrl`, que pode vir nulo.
    const userShowData = {
        id: item.id,
        username: item.username,
        profilePicture: item.profilePictureUrl ?? "",
    }

    function handleUnfriend() {
        Alert.alert(
            t("Unfriend @{{username}}", { username: item.username }),
            t("You will no longer be friends. Neither of you will be notified."),
            [
                { text: t("Cancel"), style: "cancel" },
                {
                    text: t("Unfriend"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeMutation.mutateAsync()
                            Vibrate("rigid")
                            onRefetch && onRefetch()
                        } catch (e) {
                            console.log("[friends] unfriend failed", e)
                        }
                    },
                },
            ],
        )
    }

    return (
        <View style={itemContainer}>
            <View style={{ flex: 1, alignItems: "flex-start", justifyContent: "center" }}>
                {/* `UserShow.Username` já navega para o perfil por conta própria. */}
                <UserShow.Root data={userShowData}>
                    <UserShow.ProfilePicture pictureDimensions={{ width: 38, height: 38 }} />
                    <UserShow.Username />
                </UserShow.Root>
            </View>
            <View
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    marginRight: sizes.margins["1sm"] * 1.5,
                }}
            >
                <Button
                    action={handleUnfriend}
                    margins={false}
                    height={sizes.buttons.height * 0.4}
                    backgroundColor={colors.gray.grey_07}
                >
                    <Text style={buttonText}>
                        {removeMutation.isPending ? t("Loading") : t("Unfriend")}
                    </Text>
                </Button>
            </View>
        </View>
    )
}
