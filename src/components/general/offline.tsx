import { Text } from "@/components/Themed"
import sizes from "@/constants/sizes"
import { ViewStyle, TextStyle } from "react-native"
import LanguageContext from "@/contexts/language"
import React from "react"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import WifiIcon from "@/assets/icons/svgs/wifi_slash.svg"
import Reanimated, { FadeIn, Easing } from "react-native-reanimated"

export default function OfflineCard() {
    const { t } = React.useContext(LanguageContext)

    const container: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["1lg"] * 0.8,
        borderRadius: sizes.borderRadius["1lg"] * 1.2,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const title: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family.Bold,
        fontStyle: "italic",
        marginVertical: sizes.margins["2sm"],
    }

    const description: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
    }
    return (
        <Reanimated.View
            style={container}
            entering={FadeIn.springify().duration(300).delay(100).easing(Easing.linear).damping(30)}
        >
            <WifiIcon fill={colors.gray.grey_06} width={60} height={60} />
            <Text style={title}>{t("You are offline")} 😰</Text>
            <Text style={description}>{t("Verify your internet connection")}</Text>
        </Reanimated.View>
    )
}
