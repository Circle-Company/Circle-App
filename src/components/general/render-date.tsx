import React from "react"
import { Text, View } from "react-native"
import ClockIcon from "../../assets/icons/svgs/clock.svg"
import { capitalizeFirstLetter } from "../../helpers/processText"
import ColorTheme from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"

type DateProps = {
    capitalize?: boolean
    date: string
    color?: string
    backgroundColor?: string
    scale?: number
    showIcon?: boolean
    icon?: React.ReactNode
}
export default function RenderDate({
    capitalize = true,
    date,
    color = String(ColorTheme().text),
    backgroundColor,
    scale = 1,
    showIcon = false,
    icon = (
        <ClockIcon
            fill={color}
            width={12 * scale}
            height={12 * scale}
            style={{ marginRight: sizes.margins["1sm"] * 1.4 * scale }}
        />
    ),
}: DateProps) {
    const container: any = {
        height: sizes.sizes["2md"] * 0.7 * scale,
        borderRadius: ((sizes.sizes["2md"] * 0.7) / 2) * scale,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: sizes.paddings["1sm"] * scale,
        backgroundColor,
        flexDirection: "row",
    }
    const description_style: any = {
        fontSize: fonts.size.body * 0.83 * scale,
        fontFamily: fonts.family.Semibold,
        color,
    }

    return (
        <View style={container}>
            {showIcon && icon}
            <Text style={description_style}>{capitalize ? capitalizeFirstLetter(date) : date}</Text>
        </View>
    )
}
