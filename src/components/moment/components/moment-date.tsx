import React from "react"
import { Text, View } from "react-native"
import ClockIcon from "../../../assets/icons/svgs/clock.svg"
import { timeDifferenceConverter } from "../../../helpers/dateConversor"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import MomentContext from "../context"
import { MomentDateProps } from "../moment-types"

export default function date({
    color = String(ColorTheme().text),
    paddingHorizontal = sizes.paddings["2sm"],
    backgroundColor,
    small = false,
}: MomentDateProps) {
    const { momentData } = React.useContext(MomentContext)

    const container: any = {
        borderRadius: (sizes.sizes["2md"] * 0.9) / 2,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal,
        backgroundColor,
        flexDirection: "row",
    }
    const description_style: any = {
        fontSize: fonts.size.body * 0.8,
        fontFamily: fonts.family.Semibold,
        color,
    }

    return (
        <View style={container}>
            <ClockIcon
                fill={color}
                width={14}
                height={14}
                style={{ marginRight: sizes.margins["1sm"] * 1.4 }}
            />
            <Text style={description_style}>
                {timeDifferenceConverter({ date: String(momentData.created_at), small })}
            </Text>
        </View>
    )
}
