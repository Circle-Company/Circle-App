import { Text, View } from "@/components/Themed"

import NearContext from "@/contexts/near"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"
import { t } from "i18next"
import React from "react"
import { ViewStyle } from "react-native"

export function RenderHeader() {
    const context = React.useContext(NearContext)
    const nearbyUsers = context?.nearbyUsers || []

    const headerStyle: ViewStyle = {
        height: sizes.headers.height,
        width: "100%",
        marginTop: sizes.margins["2sm"],
        justifyContent: "center",
        alignItems: "center",
    }

    if (!nearbyUsers || nearbyUsers.length === 0) return null

    return (
        <View style={headerStyle}>
            <Text style={{ fontSize: fonts.size.body * 1.1, fontFamily: fonts.family.Bold}}>
                {t("Near to You")}
            </Text>
        </View>
    )
}