import React from "react"
import { View, ViewStyle } from "react-native"
import { Profile } from "../../components/profile"
import { ProfileReciveDataProps } from "../../components/profile/profile-types"
import sizes from "../../constants/sizes"
import { AccountMomentsHeader } from "@/features/profile/profile.moments.header"

import { iOSMajorVersion } from "@/lib/platform/detection"

type RenderProfileProps = {
    user?: ProfileReciveDataProps
    isAccount: boolean
    totalMoments?: number
    lastUpdateDate?: Date
}

export function ProfileHeader({
    user,
    isAccount = false,
    totalMoments,
    lastUpdateDate,
}: RenderProfileProps) {
    const top_container: ViewStyle = {
        paddingTop: iOSMajorVersion! >= 26 ? 0 : sizes.paddings["2sm"],
        alignItems: "center",
    }
    const name_container: ViewStyle = {
        paddingTop: sizes.paddings["2md"],
        paddingBottom: user?.name ? sizes.paddings["1sm"] : 0,
    }

    if (!user) return null

    return (
        <Profile.MainRoot data={user}>
            <View style={top_container}>
                <Profile.Picture fromProfile={true} hasOutline={false} />
                <View style={name_container}>
                    <Profile.NameFollow scale={0.75} />

                    {/**
                        isAccount === false && (
                        <View style={{ marginVertical: sizes.margins["1md"] }}>
                            <Profile.Follow
                                isFollowedBy={user.interactions.isFollowedBy}
                                isFollowing={user.interactions.isFollowing}
                            />
                        </View>
                    )
                    */}
                </View>
            </View>
            {user?.description && <Profile.Description />}
            {typeof totalMoments === "number" && lastUpdateDate && (
                <View
                    style={{
                        marginTop: user?.description ? sizes.margins["1lg"] : 0,
                        marginBottom: sizes.margins["3sm"],
                    }}
                >
                    <AccountMomentsHeader
                        totalMoments={totalMoments}
                        lastUpdateDate={lastUpdateDate}
                    />
                </View>
            )}
        </Profile.MainRoot>
    )
}

export default function RenderProfile({
    user,
    isAccount,
    totalMoments,
    lastUpdateDate,
}: RenderProfileProps) {
    if (user)
        return (
            <ProfileHeader
                isAccount={isAccount}
                user={user}
                totalMoments={totalMoments}
                lastUpdateDate={lastUpdateDate}
            />
        )
    return null
}
