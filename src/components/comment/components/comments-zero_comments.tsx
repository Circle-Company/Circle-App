import PlusIcon from "@/assets/icons/svgs/plus_circle.svg"
import { Text } from "@/components/Themed"
import ButtonStandart from "@/components/buttons/button-standart"
import LanguageContext from "@/contexts/Preferences/language"
import ColorTheme from "@/layout/constants/colors"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import React from "react"
import { StyleSheet, View } from "react-native"

export default function ZeroComments() {
    const { t } = React.useContext(LanguageContext)

    const container: any = {
        width: sizes.screens.width * 0.7,
        flex: 1,
        borderRadius: sizes.borderRadius["1md"] * 1.2,
        backgroundColor: ColorTheme().backgroundDisabled,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: sizes.paddings["2sm"],
        paddingTop: sizes.paddings["1sm"],
    }

    const animatedGradient: any = {
        width: "100%",
        height: "100%",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["2sm"],
    }

    const buttonTitle: any = {
        top: -1,
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.body * 0.9,
        marginRight: sizes.margins["1sm"],
    }

    return (
        <View style={container}>
            <View
                style={{
                    marginBottom: sizes.margins["2sm"],
                    alignItems: "center",
                    alignSelf: "center",
                }}
            >
                <Text style={{ fontSize: fonts.size.caption1, color: ColorTheme().textDisabled }}>
                    {t("This Moment has no comments.")}
                </Text>
                <Text
                    style={{
                        fontFamily: fonts.family.Semibold,

                        fontSize: fonts.size.subheadline * 0.85,
                    }}
                >
                    {t("Be the first to comment.")}
                </Text>
            </View>

            <ButtonStandart
                action={() => {}}
                vibrate={() => {
                    Vibrate("effectTick")
                }}
                margins={false}
                bounciness={2}
                style={styles.buttonContainer}
            >
                <Text style={buttonTitle}>{t("Add Comment")}</Text>
                <PlusIcon style={{ top: -0.5 }} width={16} height={16} fill={"#ffffff"} />
            </ButtonStandart>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignSelf: "center",
        alignItems: "center",
        width: sizes.buttons.width * 0.5,
        height: sizes.buttons.height * 0.5,
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: "#FFFFFF20",
    },
    gradientWrapper: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonTitle: {
        top: -1,
        color: "#fff",
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.caption1,
    },
})
