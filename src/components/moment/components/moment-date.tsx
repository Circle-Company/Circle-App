import { Text, View } from "react-native"

import React from "react"
import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import MomentContext from "../context"
import { MomentDateProps } from "../moment-types"
import LanguageContext from "@/contexts/language"
import { useLocaleDateRelative } from "@/lib/hooks/useLocaleDate"

export default function Date({
    color = String(ColorTheme().text),
    paddingHorizontal = sizes.paddings["2sm"],
    backgroundColor,
    small = false,
}: MomentDateProps) {
    const { data } = React.useContext(MomentContext)

    const container: any = {
        borderRadius: (sizes.sizes["2md"] * 0.9) / 2,
        paddingHorizontal,
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
