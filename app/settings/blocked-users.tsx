import { FlatList, Alert } from "react-native"
import { View } from "react-native"
import { Text } from "@/components/Themed"
import { UserShow } from "@/components/user_show"
import { ViewStyle } from "react-native"
import sizes from "@/constants/sizes"
import { colors } from "@/constants/colors"
import Button from "@/components/buttons/button-standart"
import React from "react"
import LanguageContext from "@/contexts/language"
import { TextStyle } from "react-native"
import fonts from "@/constants/fonts"
import { RefreshControl } from "react-native"
import { useAccountBlocksQuery } from "@/queries"
import { useUnlockMutation } from "@/queries/user.block"

export default function BlockedUsersScreen() {
    const { t } = React.useContext(LanguageContext)
    const { data, isPending, isLoading, isRefetching, refetch } = useAccountBlocksQuery()

    const container: ViewStyle = {
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        flex: 1,
    }

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
    }

    const emptyDescription: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
    }

    function BlockedRow({
        item,
        onRefetch,
    }: {
        item: { id: string; username: string; profilePicture: string }
        onRefetch: () => void
    }) {
        const { t } = React.useContext(LanguageContext)
        const [isLoading, setIsLoading] = React.useState(false)
        const unlockMutation = useUnlockMutation({ userId: item.id })

        const buttonText: TextStyle = {
            fontFamily: fonts.family.Bold,
            fontSize: fonts.size.body,
            color: colors.gray.grey_01,
        }

        const handleUnlock = () => {
            Alert.alert(t("Confirm"), t("Do you want to unblock this user?"), [
                { text: t("Cancel"), style: "cancel" },
                {
                    text: t("Unlock"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true)
                            await unlockMutation.mutateAsync()
                            onRefetch && onRefetch()
                        } finally {
                            setIsLoading(false)
                        }
                    },
                },
            ])
        }

        return (
            <View style={itemContainer}>
                <View
                    style={{
                        flex: 1,
                        alignItems: "flex-start",
                        justifyContent: "center",
                    }}
                >
                    <UserShow.Root data={item}>
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
                        action={handleUnlock}
                        margins={false}
                        height={sizes.buttons.height * 0.4}
                        backgroundColor={colors.gray.grey_07}
                    >
                        <Text style={buttonText}>{isLoading ? t("Loading") : t("Unlock")}</Text>
                    </Button>
                </View>
            </View>
        )
    }

    return (
        <FlatList
            style={container}
            data={data?.blocks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.5}
            refreshControl={
                <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    tintColor="#888"
                    colors={["#888"]}
                />
            }
            renderItem={({ item }) => <BlockedRow item={item} onRefetch={refetch} />}
            ListEmptyComponent={() => {
                return (
                    <View style={emptyContainer}>
                        <Text style={emptyTitle}>{t("You have no blocked users")} 🤩</Text>
                        <Text style={emptyDescription}>
                            {t(
                                "If you feel uncomfortable with a user, you can block them to have the best experience on the Circle App.",
                            )}
                        </Text>
                    </View>
                )
            }}
        />
    )
}
