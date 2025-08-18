import MemoriesIcon from "@/assets/icons/svgs/memories.svg"
import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../../constants/colors"
import fonts from "../../../../constants/fonts"
import sizes from "../../../../constants/sizes"
import { Text } from "../../../Themed"
import { MemoryHeaderLeftProps } from "../../memory-types"

export default function header_left({ children, number = 0 }: MemoryHeaderLeftProps) {
    const container: any = {
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        flex: 1,
    }
    const header_number: any = {
        marginLeft: sizes.margins["1sm"],
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Semibold,
    }

    if (children) return <View style={container}>{children}</View>
    else
        return (
            <View style={container}>
                <MemoriesIcon fill={ColorTheme().text} width={12} height={12} />
                <Text style={header_number}>{number}</Text>
            </View>
        )
}
