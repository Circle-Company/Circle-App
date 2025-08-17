import React from "react"
import { ViewStyle } from "react-native"
import { View } from "../../../../components/Themed"
import { Profile } from "../../../../components/profile"
import sizes from "../../../../constants/sizes"
export default function RenderStatistics() {
    const container: ViewStyle = {
        paddingVertical: sizes.paddings["1sm"],
    }

    return (
        <View style={container}>
            <Profile.Statistics.Container>
                <Profile.Statistics.Followers />
                <Profile.Statistics.Likes />
                <Profile.Statistics.Views />
            </Profile.Statistics.Container>
        </View>
    )
}
