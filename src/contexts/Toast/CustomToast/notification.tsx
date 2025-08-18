import { View } from "react-native"
import { Text } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"

type CustomToastProps = {
    title: string
    description: string
}
export function Toast({ title, description }: CustomToastProps) {
    const container: any = {
        backgroundColor: ColorTheme().backgroundDisabled,
        padding: sizes.paddings["1sm"],
        borderRadius: sizes.borderRadius["1md"] * 0.7,
        flexDirection: "row",
    }

    const rightContainer: any = {
        flex: 1,
    }

    const titleStyle: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        marginBottom: sizes.margins["1sm"],
    }

    const descriptionStyle: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }
    return (
        <View style={container}>
            <View style={rightContainer}>
                <Text style={titleStyle}>{title}</Text>
                <Text style={descriptionStyle}>{description}</Text>
            </View>
        </View>
    )
}
