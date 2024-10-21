import { Text, View } from "@/components/Themed"
import ColorTheme from "@/layout/constants/colors"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"

export default function endReached({
    text,
    width = sizes.screens.width,
    backgroundColor,
}: {
    text: string
    backgroundColor?: string
    width?: number
}) {
    const container: any = {
        width,
        height: sizes.headers.height,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
    }

    const title: any = {
        fontSize: fonts.size.body * 0.8,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().textDisabled,
    }

    return (
        <View style={container}>
            <Text style={title}>{text}</Text>
        </View>
    )
}
