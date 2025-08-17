import MemoryIcon from "@/assets/icons/svgs/memories.svg"
import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Text } from "../../../../../components/Themed"
import ColorTheme from "../../../../../constants/colors"
import fonts from "../../../../../constants/fonts"
import sizes from "../../../../../constants/sizes"

type RenderMemoriesCountProps = {
    count: number
    backgroundColor?: string
    color?: string
    icon?: React.ReactNode
}

export default function RenderMemoriesCount({
    count,
    backgroundColor,
    color = String(ColorTheme().text),
    icon = (
        <MemoryIcon
            fill={color}
            width={11}
            height={11}
            style={{ marginRight: sizes.margins["1sm"] * 1.4 }}
        />
    ),
}: RenderMemoriesCountProps) {
    const container: ViewStyle = {
        height: sizes.sizes["2md"] * 0.7,
        borderRadius: (sizes.sizes["2md"] * 0.7) / 2,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: sizes.paddings["1sm"],
        backgroundColor,
        flexDirection: "row",
    }
    const description_style: TextStyle = {
        fontSize: fonts.size.body * 0.8,
        fontFamily: fonts.family.Semibold,
        color,
    }
    /**
     *return (
        <View style={container}>
            {icon}
            <Text style={description_style}>{count}</Text>  
        </View>
        )
     */

    return (
        <View style={container}>
            {icon}
            <Text style={description_style}>{count}</Text>
        </View>
    )
}
