import Animated, { FadeIn } from "react-native-reanimated"
import { Text, TextStyle, ViewStyle } from "@/components/Themed"

import ColorTheme from "@/layout/constants/colors"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"
import { t } from "i18next"

export function RenderError() {
    const theme = ColorTheme()

    const containerStyle: ViewStyle = {
        backgroundColor: theme.error,
        borderRadius: sizes.borderRadius["1md"],
        marginHorizontal: sizes.margins["1md"],
        marginTop: sizes.margins["2sm"],
        paddingVertical: sizes.margins["2sm"],
        width: sizes.screens.width - sizes.margins["1md"] * 2,
    }

    const textStyle: TextStyle = {
        color: theme.titleAccent,
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.body,
        textAlign: "center",
    }

    return (
        <Animated.View 
            entering={FadeIn.duration(500).delay(200).withInitialValues({ opacity: 0 })}
            style={containerStyle}
        >
            <Text style={textStyle}>{t("error.list.near")}</Text>
        </Animated.View>
    )
}