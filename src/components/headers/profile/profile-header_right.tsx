import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import { Skeleton } from "../../skeleton"
import { UserShow } from "../../user_show"
import { View } from "react-native"
import ViewProfileContext from "../../../contexts/viewProfile"
import sizes from "../../../constants/sizes"

export default function ProfileHeaderRight() {
    const { session } = React.useContext(PersistedContext)
    const { userProfile } = React.useContext(ViewProfileContext)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        setIsLoading(true),
            setTimeout(() => {
                setIsLoading(false)
            }, 400)
    }, [])
    const container: any = {
        flexDirection: "row",
        alignItems: "center",
    }
    if (session.user.id == userProfile.id) return null
    else
        return (
            <View style={container}>
                <View style={{ marginRight: sizes.margins["3sm"] }}>
                    <UserShow.Root data={userProfile}>
                        {isLoading ? (
                            <Skeleton.View
                                delay={0}
                                duration={400}
                                style={{
                                    marginTop: sizes.margins["1sm"] * 0.7,
                                    width: 70,
                                    height: 24,
                                    marginLeft: sizes.margins["2sm"],
                                    borderRadius: 7,
                                }}
                            />
                        ) : (
                            <UserShow.FollowButton
                                isFollowing={userProfile.youFollow}
                                hideOnFollowing={false}
                                displayOnMoment={false}
                            />
                        )}
                    </UserShow.Root>
                </View>
            </View>
        )
}
