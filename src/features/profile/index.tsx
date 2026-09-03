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
        paddingTop: sizes.paddings["1sm"],
    }

    if (!user) return null

    return (
        <Profile.MainRoot data={user}>
            <View style={top_container}>
                <Profile.Picture fromProfile={true} hasOutline={false} />
                {user.interactions?.isBlocking === false &&
                    user.interactions?.isBlockedBy === false && <Profile.NameFollow scale={0.75} />}
                {isAccount === false &&
                    user.interactions?.isBlocking === false &&
                    user.interactions?.isBlockedBy === false &&
                    !!user.id && (
                        <View style={{ marginTop: sizes.margins["3sm"] }}>
                            <Profile.Friend
                                userId={String(user.id)}
                                username={user.username}
                                initialRelation={user.interactions?.friendshipStatus}
                            />
                        </View>
                    )}
            </View>
            {user.interactions?.isBlocking && isAccount === false && <Profile.BlockingCard />}
            {user.interactions?.isBlockedBy && isAccount === false && <Profile.BlockedByCard />}
            {/**user?.description && <Profile.Description />**/}
            {typeof totalMoments === "number" &&
                lastUpdateDate &&
                user.interactions.isBlockedBy === false &&
                user.interactions.isBlocking === false && (
                    <View
                        style={{
                            marginTop: user?.name ? sizes.margins["1sm"] * 0.5 : 0,
                            marginBottom: sizes.margins["3sm"],
                        }}
                    >
                        <AccountMomentsHeader
                            isBlockedBy={user.interactions.isBlockedBy}
                            isBlocking={user.interactions.isBlocking}
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
