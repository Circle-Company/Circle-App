import { View } from "react-native"
import { Text } from "../../../components/Themed"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"

type CustomToastProps = {
    title: string
    titleColor: string
    backgroundColor: string
    icon: React.ReactNode | null
}
export function Toast({ title, titleColor, backgroundColor, icon }: CustomToastProps) {
    const container: any = {
        backgroundColor,
        paddingHorizontal: sizes.paddings["1sm"],
        paddingVertical: sizes.paddings["1sm"] * 0.8,
        borderRadius: sizes.borderRadius["1md"],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    }

    const leftContainer: any = {
        marginLeft: sizes.margins["1sm"],
        flex: 1,
    }

    const rightContainer: any = {
        alignItems: "center",
        justifyContent: "center",
        marginLeft: sizes.margins["1sm"],
        marginRight: sizes.margins["1sm"],
    }

    const titleStyle: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        color: titleColor,
    }

    return (
        <View style={container}>
            <View style={leftContainer}>
                <Text style={titleStyle}>{title}</Text>
            </View>

            {icon && <View style={rightContainer}>{icon}</View>}
        </View>
    )
}
