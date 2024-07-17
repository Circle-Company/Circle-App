import React from "react"
import { RefreshControl, ScrollView, StatusBar, useColorScheme, View } from "react-native"
import ProfileHeader from "../../../components/headers/profile/profile-header"
import { Loading } from "../../../components/loading"
import ViewProfileContext from "../../../contexts/viewProfile"
import ListMemories from "../../../features/list-memories/list-memories-preview"
import RenderProfile from "../../../features/render-profile"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
export default function ProfileScreen() {
    const { userProfile, setProfile } = React.useContext(ViewProfileContext)
    const [refreshing, setRefreshing] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        top: 0,
    }

    const handleRefresh = () => {
        setLoading(true)
        setProfile(userProfile.id).finally(() => {
            setTimeout(() => {
                setLoading(false)
                setRefreshing(false)
            }, 200)
        })
    }

    React.useEffect(() => {
        if (!userProfile) setLoading(true)
        else setLoading(false)
    }, [])

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <ProfileHeader />
            <ScrollView
                style={container}
                showsVerticalScrollIndicator={false}
                horizontal={false}
                refreshControl={
                    <RefreshControl
                        progressBackgroundColor={String(
                            isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02
                        )}
                        colors={[
                            String(isDarkMode ? colors.gray.grey_04 : colors.gray.grey_04),
                            "#00000000",
                        ]}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                {loading ? (
                    <Loading.Container
                        width={sizes.screens.width}
                        height={sizes.screens.height / 3}
                    >
                        <Loading.ActivityIndicator />
                    </Loading.Container>
                ) : (
                    <RenderProfile user={userProfile} />
                )}
            </ScrollView>
            <ListMemories isAccountScreen={false} user={userProfile} />
        </View>
    )
}
