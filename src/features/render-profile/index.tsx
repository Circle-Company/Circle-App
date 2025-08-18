import React from "react"
import { View, ViewStyle } from "react-native"
import { Profile } from "../../components/profile"
import { userReciveDataProps } from "../../components/user_show/user_show-types"
import sizes from "../../constants/sizes"

type RenderProfileProps = {
    user: userReciveDataProps
}

export default function RenderProfile({ user }: RenderProfileProps) {
    const top_container: ViewStyle = {
        paddingTop: sizes.paddings["2sm"],
        alignItems: "center",
    }
    const name_container: ViewStyle = {
        paddingTop: sizes.paddings["1sm"] * 0.6,
    }

    return (
        <Profile.MainRoot data={user}>
            <View style={top_container}>
                <Profile.Picture fromProfile={true} />
                <View style={name_container}>
                    <Profile.Name scale={0.8} />
                </View>
            </View>
            <Profile.Statistics.Container>
                <Profile.Statistics.Followers />
                <Profile.Statistics.Likes />
                <Profile.Statistics.Views />
            </Profile.Statistics.Container>
            <Profile.Description />
        </Profile.MainRoot>
    )
}
