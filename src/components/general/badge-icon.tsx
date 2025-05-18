import sizes from "@/layout/constants/sizes"
import React from "react"
import { Text, View, ViewStyle } from "react-native"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"

type BadgeIconProps = {
    active?: boolean
    style?: ViewStyle
    number: number
}

export function BadgeIcon({ active = true, number, style }: BadgeIconProps) {
    const [isVisible, setIsVisible] = React.useState<boolean>(false)

    // Monitorar as mudanças nas propriedades para determinar a visibilidade do badge
    React.useEffect(() => {
        if (active && number > 0) {
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }, [active, number])

    const badgeStyleWithNumber = style
        ? {
            zIndex: 10,
            position: "absolute",
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "center",
            borderRadius: 50,
            paddingVertical: sizes.paddings["1sm"] * 0.2,
            paddingHorizontal: sizes.paddings["1sm"] * 0.8,
            backgroundColor: ColorTheme().error,
            borderWidth: 3,
            borderColor: ColorTheme().background,
            ...style,
        }
        : {
            zIndex: 10,
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            top: -3,
            right: -9,
            borderRadius: 50,
            paddingVertical: sizes.paddings["1sm"] * 0.2,
            paddingHorizontal: sizes.paddings["1sm"] * 0.8,
            backgroundColor: ColorTheme().error,
            borderWidth: 3,
            borderColor: ColorTheme().background,
        }

    const badgeTextStyle: any = {
        top: -0.2,
        left: 0.2,
        fontSize: fonts.size.caption1 * 0.95,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white,
    }

    if (!isVisible) return null

    return (
        <View style={badgeStyleWithNumber}>
            <Text style={badgeTextStyle}>{number}</Text>
        </View>
    )
}
