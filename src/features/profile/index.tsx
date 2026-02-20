import React from "react"
import { View, ViewStyle } from "react-native"
import { Profile } from "../../components/profile"
import { ProfileReciveDataProps } from "../../components/profile/profile-types"
import sizes from "../../constants/sizes"
import { AccountMomentsHeader } from "@/features/profile/profile.moments.header"

import { iOSMajorVersion } from "@/lib/platform/detection"
import { SwiftBottomSheet } from "@/components/ios/ios.bottom.sheet"
import { ProfileReportModal } from "./profile.report.modal"
import ProfileContext from "@/contexts/profile"

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
    const { showReportModal, setShowReportModal } = React.useContext(ProfileContext)
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
                {user.interactions?.isBlocking === false ||
                    (user.interactions?.isBlockedBy === false && (
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
                    ))}
            </View>
            {user.interactions?.isBlocking && isAccount === false && <Profile.BlockingCard />}
            {user.interactions?.isBlockedBy && isAccount === false && <Profile.BlockedByCard />}
            {user?.description && <Profile.Description />}
            {typeof totalMoments === "number" &&
                lastUpdateDate &&
                user.interactions.isBlockedBy === false &&
                user.interactions.isBlocking === false && (
                    <View
                        style={{
                            marginTop: user?.description ? sizes.margins["1lg"] : 0,
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
            {showReportModal && (
                <SwiftBottomSheet
                    snapPoints={[1]}
                    isOpened={showReportModal}
                    onIsOpenedChange={(opened) => {
                        if (!opened) setShowReportModal(false)
                    }}
                >
                    <ProfileReportModal />
                </SwiftBottomSheet>
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
