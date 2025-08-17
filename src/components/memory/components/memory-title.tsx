import React from "react"
import { Text, View } from "react-native"
import { truncated } from "../../../helpers/processText"
import { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import MomentContext from "../../moment/context"

type MemoryDescriptionProps = {}

export default function title({}: MemoryDescriptionProps) {
    const { momentData } = React.useContext(MomentContext)

    const container: any = {
        zIndex: 4,
        alignitems: "flex-start",
        justifyContent: "center",
    }
    const text_style: any = {
        lineHeight: 13,
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
        textShadowColor: "#00000070",
        textShadowOffset: { width: 0.3, height: 0.7 },
        textShadowRadius: 4,
        flexDirection: "row",
        justifyContent: "space-between",
    }

    return (
        <View style={container}>
            <Text style={text_style}>
                {truncated({ text: String(momentData.description), size: 42 })}
            </Text>
        </View>
    )
}
