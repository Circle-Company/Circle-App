import React from "react"
import { Text, View } from "react-native"
import SignalIcon from "../../../assets/icons/svgs/dot_radiowaves_left_and_right.svg"
import { timeDifferenceConverter } from "../../../helpers/dateConversor"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { useProfileContext } from "../profile-context"
type DateProps = {
    color?: string
    backgroundColor?: string
}
export default function Last_active_at({
    color = String(ColorTheme().text),
    backgroundColor = String(ColorTheme().secundaryBackground),
}: DateProps) {
    const { user } = useProfileContext()
    const container: any = {
        height: sizes.sizes["2md"] * 0.7,
        borderRadius: (sizes.sizes["2md"] * 0.7) / 2,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: sizes.paddings["1sm"],
        backgroundColor,
        flexDirection: "row",
    }
    const description_style: any = {
        fontSize: fonts.size.body * 0.68,
        fontFamily: fonts.family.Semibold,
        color,
    }

    return (
        <View style={container}>
            <SignalIcon
                fill={color}
                width={12}
                height={12}
                style={{ marginRight: sizes.margins["1sm"] * 1.4 }}
            />
            <Text style={description_style}>
                {timeDifferenceConverter({ date: String(user.last_active_at), small: false })}
            </Text>
        </View>
    )
}
