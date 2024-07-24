import React from "react"
import { View } from "react-native"
import { Profile } from "../../components/profile"
import { userReciveDataProps } from "../../components/user_show/user_show-types"
import sizes from "../../layout/constants/sizes"
import RenderStatistics from "./render-statistics"

type RenderProfileProps = {
    user: userReciveDataProps
}

export default function RenderProfile({ user }: RenderProfileProps) {
    const top_container: any = {
        paddingTop: sizes.paddings["1md"],
        alignItems: "center",
    }
    const name_container: any = {
        paddingTop: sizes.paddings["1sm"],
        paddingBottom: sizes.paddings["1sm"] * 0.6,
    }

    console.log("render-profile: ", user)
    return (
        <Profile.MainRoot data={user}>
            <View style={top_container}>
                <Profile.Picture fromProfile={true} />
                <View style={name_container}>
                    <Profile.Name scale={0.8} />
                </View>
            </View>

            <RenderStatistics />
            <Profile.Description />
        </Profile.MainRoot>
    )
}
