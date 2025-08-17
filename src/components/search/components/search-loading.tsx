import { View, ViewStyle } from "@/components/Themed"

import { Loading } from "@/components/loading"
import { colors } from "@/layout/constants/colors"
import sizes from "@/layout/constants/sizes"
import React from "react"
import { useColorScheme } from "react-native"

export default function LoadingCard() {
    const isDarkMode = useColorScheme() === "dark"

    const container: ViewStyle = {
        marginTop: sizes.margins["2sm"],
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        height: sizes.headers.height,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderRadius: sizes.borderRadius["1md"],
    }

    return (
        <View style={container}>
            <Loading.ActivityIndicator size={20} />
        </View>
    )
}
