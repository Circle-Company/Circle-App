import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import ProfileHeaderLeft from "./profile-header_left"
import ProfileHeaderRight from "./profile-header_right"

export default function ProfileHeader() {
    const container: any = {
        ...sizes.headers,
        flexDirection: "row",
        backgroundColor: ColorTheme().background,
        zIndex: 1000,
    }
    const left_container: any = {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
    }
    const right_container: any = {
        alignItems: "center",
        justifyContent: "flex-end",
        flexDirection: "row",
    }

    return (
        <View style={container}>
            <View style={left_container}>
                <ProfileHeaderLeft />
            </View>
            <View style={right_container}>
                <ProfileHeaderRight />
            </View>
        </View>
    )
}
