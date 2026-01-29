import { View } from "react-native"
import { Text } from "../../components/Themed"
import ColorTheme, { colors } from "../../constants/colors"
import fonts from "../../constants/fonts"
import sizes from "../../constants/sizes"
import { TextStyle } from "react-native"
import { ViewStyle } from "react-native"

type CustomToastProps = {
    title: string
    tint?: string
}

export function Toast({ title, tint }: CustomToastProps) {
    const container: ViewStyle = {
        backgroundColor: colors.gray.grey_07,
        paddingVertical: sizes.paddings["2sm"] * 0.9,
        borderRadius: sizes.borderRadius["1md"] * 0.9,
        flexDirection: "row",
        alignItems: "center",
        width: sizes.screens.width * 0.9,
    }

    const textContainer: ViewStyle = {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    }

    const titleStyle: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family["Bold-Italic"],
        textAlign: "center",
        color: tint,
    }

    return (
        <View style={container}>
            <View style={textContainer}>{!!title && <Text style={titleStyle}>{title}</Text>}</View>
        </View>
    )
}
