import { Text, TextStyle, ViewStyle } from "../../../../../../components/Themed"

import { View } from "react-native"
import ColorTheme from "../../../../../../constants/colors"
import fonts from "../../../../../../constants/fonts"
import sizes from "../../../../../../constants/sizes"

export default function endReached({ text }: { text: string }) {
    const container: ViewStyle = {
        width: sizes.screens.width,
        height: sizes.headers.height,
        alignItems: "center",
        justifyContent: "center",
    }

    const title: TextStyle = {
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
