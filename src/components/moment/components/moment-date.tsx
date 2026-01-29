import React from "react"
import { Text, View } from "react-native"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import ColorTheme from "@/constants/colors"
import MomentContext from "@/components/moment/context"
import { MomentDateProps } from "@/components/moment/moment-types"
import { useLocaleDateRelative } from "@/lib/hooks/useLocaleDate"

export default function Date({
    color = String(ColorTheme().text),
    backgroundColor,
}: MomentDateProps) {
    const { data } = React.useContext(MomentContext)

    const container: any = {
        borderRadius: (sizes.sizes["2md"] * 0.9) / 2,
        backgroundColor,
        flexDirection: "row",
        opacity: 0.6,
    }
    const description_style: any = {
        fontSize: fonts.size.body * 0.8,
        fontFamily: fonts.family.Semibold,
        color,
    }

    return (
        <View style={container}>
            <Text style={description_style} selectable={false}>
                {data.publishedAt ? useLocaleDateRelative(data.publishedAt) : ""}
            </Text>
        </View>
    )
}
