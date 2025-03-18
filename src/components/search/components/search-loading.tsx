import { View } from "@/components/Themed"
import { Loading } from "@/components/loading"
import { colors } from "@/layout/constants/colors"
import sizes from "@/layout/constants/sizes"
import React from "react"
import { useColorScheme } from "react-native"

export default function loading_card() {
    const isDarkMode = useColorScheme() === "dark"

    const container: any = {
        marginTop: sizes.margins["2sm"],
        width: sizes.screens.width,
        height: sizes.headers.height,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        paddingHorizontal: sizes.paddings["2sm"],
        borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
    }

    return (
        <View style={container}>
            <Loading.ActivityIndicator size={20} />
        </View>
    )
}
