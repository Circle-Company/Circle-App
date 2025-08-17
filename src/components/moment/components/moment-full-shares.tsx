import React from "react"
import { Text, View } from "react-native"
import Icon from "../../../assets/icons/svgs/arrow_shape_right.svg"
import { formatNumberWithDots } from "../../../helpers/numberConversor"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

type MomentFullSharesProps = {
    color?: string
    shares: number
}

export default function shares({
    shares,
    color = String(ColorTheme().text),
}: MomentFullSharesProps) {
    const container: any = {
        borderRadius: (sizes.sizes["2md"] * 0.9) / 2,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    }
    const number_style: any = {
        fontSize: fonts.size.body * 0.8,
        fontFamily: fonts.family.Semibold,
        color,
    }
    if (shares == 0) return null
    else
        return (
            <View style={container}>
                <Icon
                    fill={color}
                    width={14}
                    height={14}
                    style={{ marginRight: sizes.margins["1sm"] * 1.4 }}
                />
                <Text style={number_style}>{formatNumberWithDots(shares)}</Text>
            </View>
        )
}
