import React from "react"
import { View } from "react-native"
import sizes from "../../../layout/constants/sizes"
import { Moment } from "../../moment"

export default function MomentFullHeaderRight() {
    const container: any = {
        marginRight: sizes.margins["1md"],
        flexDirection: "row",
        alignItems: "center",
    }

    const buttons_container: any = {
        flexDirection: "row",
        alignItems: "center",
    }

    return (
        <View style={container}>
            <View style={buttons_container}>
                <View style={{ marginRight: sizes.margins["2sm"] }}>
                    <Moment.ShareButton />
                </View>
                <Moment.MoreButton />
            </View>
        </View>
    )
}
