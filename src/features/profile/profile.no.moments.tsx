import { Text } from "@/components/Themed"
import sizes from "@/constants/sizes"
import { ViewStyle } from "react-native"
import LanguageContext from "@/contexts/language"
import React from "react"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import { router } from "expo-router"
import ButtonStandart from "@/components/buttons/button-standart"
import { TextStyle } from "react-native"
import Reanimated, { FadeIn, SlideInUp, Easing } from "react-native-reanimated"

export function NoMoments() {
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
        marginBottom: sizes.margins["2sm"],
    }

    const description: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
    }
    const buttonContainer: ViewStyle = {
        alignSelf: "center",
        alignItems: "center",
        marginTop: sizes.margins["1md"],
        maxWidth: sizes.buttons.width,
        height: sizes.buttons.height * 0.5,
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: colors.gray.white,
    }

    const buttonTitle: any = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body * 1.2,
        color: colors.gray.black,
    }
    function handlePress() {
        router.navigate("/(tabs)/create")
    }

    return (
        <Reanimated.View
            style={container}
            entering={FadeIn.springify().duration(300).delay(100).easing(Easing.linear).damping(30)}
        >
            <Text style={title}>{t("Nothing to show for now")} 🥲</Text>
            <Text style={description}>
                {t("It seems that you haven't shared anithing in the last 30 days")}
            </Text>
            <ButtonStandart
                action={handlePress}
                vibrate={() => {
                    Vibrate("effectTick")
                }}
                margins={false}
                bounciness={2}
                style={buttonContainer}
            >
                <Text style={buttonTitle}>{t("Create Moment")}</Text>
            </ButtonStandart>
        </Reanimated.View>
    )
}
