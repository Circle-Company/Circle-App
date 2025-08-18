import { View } from "react-native"
import { Text } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"

type CustomToastProps = {
    message: string
}
export function Toast({ message }: CustomToastProps) {
    const container: any = {
        backgroundColor: ColorTheme().backgroundDisabled,
        padding: sizes.paddings["1sm"],
        borderRadius: sizes.borderRadius["1md"] * 0.7,
        flexDirection: "row",
        alignItems: "center",
    }

    const messageStyle: any = {
        fontSize: fonts.size.body,
    }
    return (
        <View style={container}>
            <Text style={messageStyle}>{message}</Text>
        </View>
    )
}
