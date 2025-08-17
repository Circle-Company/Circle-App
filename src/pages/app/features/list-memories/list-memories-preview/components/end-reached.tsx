import { View } from "react-native"

import { Text } from "../../../../../../components/Themed"
import ColorTheme from "../../../../../../constants/colors"
import fonts from "../../../../../../constants/fonts"
import sizes from "../../../../../../constants/sizes"

type EndReachedProps = {
    text: string
    width?: number
    height?: number
    style?: HTMLDivElement
}
export default function endReached({
    text,
    width = sizes.screens.width,
    height = sizes.headers.height,
    style,
}: EndReachedProps) {
    const container: any = {
        alignSelf: "center",
        width: width,
        height: height,
        alignItems: "center",
        justifyContent: "center",
    }

    const title: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().textDisabled,
    }

    return (
        <View style={container}>
            <Text style={title}>{text}</Text>
        </View>
    )
}
