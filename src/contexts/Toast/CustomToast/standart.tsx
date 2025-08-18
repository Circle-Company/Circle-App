import { View } from "react-native"
import { Text } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"

type CustomToastProps = {
    title: string
    description: string
    icon: React.ReactNode | null
}
export function Toast({ title, description, icon }: CustomToastProps) {
    const container: any = {
        backgroundColor: ColorTheme().backgroundDisabled,
        padding: sizes.paddings["1sm"],
        borderRadius: sizes.borderRadius["1md"] * 0.7,
        flexDirection: "row",
    }

    const leftContainer: any = {
        alignItems: "center",
        justifyContent: "center",
        marginLeft: sizes.margins["1sm"],
        marginRight: sizes.margins["2sm"],
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
        fontSize: fonts.size.body * 0.7,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }
    return (
        <View style={container}>
            {icon && <View style={leftContainer}>{icon}</View>}
            <View style={rightContainer}>
                <Text style={titleStyle}>{title}</Text>
                <Text style={descriptionStyle}>{description}</Text>
            </View>
        </View>
    )
}
