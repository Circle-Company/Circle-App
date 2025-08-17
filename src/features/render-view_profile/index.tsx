import { View, useColorScheme } from "react-native"
import { Profile } from "../../components/profile"
import sizes from "../../layout/constants/sizes"
import RenderStatistics from "./render-statistics"

type RenderViewProfileProps = {
    user: any
}
export default function RenderViewProfile({ user }: RenderViewProfileProps) {
    console.log("RenderViewProfile: ", user)
    const isDarkMode = useColorScheme() === "dark"
    const top_container: any = {
        paddingTop: sizes.paddings["1sm"],
        alignItems: "center",
    }
    const name_container: any = {
        paddingTop: sizes.paddings["1sm"],
        paddingBottom: sizes.paddings["1sm"] * 0.6,
    }
    const description_container: any = {}
    return (
        <Profile.MainRoot data={user}>
            <View style={top_container}>
                <Profile.Picture />
                <View style={name_container}>
                    <Profile.Name scale={0.8} />
                </View>
            </View>

            <RenderStatistics />
            <View style={description_container}>
                <Profile.Description />
            </View>
        </Profile.MainRoot>
    )
}
