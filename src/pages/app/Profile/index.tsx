import ProfileHeader from "@/components/headers/profile/profile-header"
import { RenderProfileSkeleton } from "@/features/render-profile/skeleton"
import React from "react"
import { useColorScheme, View } from "react-native"
import ViewProfileContext from "../../../contexts/viewProfile"
import ListMemories from "../../../features/list-memories/list-memories-preview"
import RenderProfile from "../../../features/render-profile"
import { AnimatedVerticalScrollView } from "../../../lib/hooks/useAnimatedScrollView"
export default function ProfileScreen() {
    const { userProfile, setProfile } = React.useContext(ViewProfileContext)
    const [refreshing, setRefreshing] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        top: 0,
    }

    const handleRefresh = () => {
        setRefreshing(true)
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
            <ProfileHeader />
            <AnimatedVerticalScrollView
                onEndReachedThreshold={0.1}
                handleRefresh={handleRefresh}
                endRefreshAnimationDelay={400}
                showRefreshSpinner={false}
                onEndReached={async () => await setProfile(userProfile.id)}
            >
                {loading ? <RenderProfileSkeleton /> : <RenderProfile user={userProfile} />}
                <ListMemories
                    userRefreshing={refreshing}
                    isAccountScreen={false}
                    user={userProfile}
                />
            </AnimatedVerticalScrollView>
        </View>
    )
}
