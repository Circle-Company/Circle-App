import { colors } from "@/constants/colors"
import { View, ViewStyle, Text, TextStyle } from "react-native"
import MomentContext from "../context"
import React from "react"
import fonts from "@/constants/fonts"

export function Hidden({ width, height }: { width: number; height: number }) {
    const { size } = React.useContext(MomentContext)
    const container: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        alignSelf: "center",
        zIndex: 1,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width,
        height,
        backgroundColor: colors.gray.black + 99,
    }

    const title: TextStyle = {
        fontSize: size.width * 0.06,
        fontFamily: fonts.family["Bold-Italic"],
        fontStyle: "italic",
        color: colors.gray.grey_03 + 99,
    }

    return (
        <View style={container}>
            <Text style={title}>Hidden Moment</Text>
        </View>
    )
}
