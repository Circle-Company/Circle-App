import { StyleSheet, Text, View } from "react-native"

import Icon from "@/assets/icons/svgs/eye.svg"
import React from "react"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import { formatNumberWithDots } from "../../../helpers/numberConversor"

interface MomentFullViewsProps {
    color?: string
    views: number
}

const MomentFullViews: React.FC<MomentFullViewsProps> = ({ views, color = ColorTheme().text }) => {
    if (views === 0) return null

    const styles = StyleSheet.create({
        container: {
            alignItems: "center",
            borderRadius: (sizes.sizes["2md"] * 0.9) / 2,
            flexDirection: "row",
            justifyContent: "center",
        },
        icon: {
            marginRight: sizes.margins["1sm"] * 1.4,
        },
        numberText: {
            color,
            fontFamily: fonts.family.Semibold,
            fontSize: fonts.size.body * 0.8,
        },
    })

    if (views === 0) return null

    return (
        <View style={styles.container}>
            <Icon fill={color} width={14} height={14} style={styles.icon} />
            <Text style={styles.numberText}>{formatNumberWithDots(views)}</Text>
        </View>
    )
}

export default MomentFullViews
