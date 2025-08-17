import { View } from "../../../../components/Themed"
import { Profile } from "../../../../components/profile"
import sizes from "../../../../constants/sizes"

type RenderStatisticsProps = {}

export default function RenderStatistics({}: RenderStatisticsProps) {
    const container: any = {
        paddingVertical: sizes.paddings["1sm"] * 0.8,
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
