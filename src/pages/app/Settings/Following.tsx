import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { Search } from "../../../components/search"
import { Text, View } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import { AnimatedVerticalFlatlist } from "../../../lib/hooks/useAnimatedFlatList"
import { useFindAccountFollowingsQuery } from "../../../state/queries/find-followings"

export default function FollowingScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const container = {
        alignItems: "center",
        flex: 1,
    }

    const { data, isSuccess, isError, isLoading, refetch, isFetching } =
        useFindAccountFollowingsQuery()

    if (isLoading) {
    }

    if (isError) {
    }

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            {isSuccess && data ? (
                <AnimatedVerticalFlatlist
                    onEndReached={refetch}
                    onEndReachedThreshold={0.1}
                    handleRefresh={handleRefresh}
                    showRefreshSpinner={false}
                    data={data.data}
                    renderItem={({ item }) => {
                        return <Search.RenderUser user={item} />
                    }}
                    refreshControl={<></>}
                />
            ) : (
                <Text>No followings found.</Text>
            )}
        </View>
    )
}
