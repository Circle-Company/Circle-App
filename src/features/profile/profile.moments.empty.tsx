import sizes from "@/constants/sizes"
import { ViewStyle } from "react-native"
import { Text, View } from "@/components/Themed"
import React from "react"
import LanguageContext from "@/contexts/language"
import { TextStyle } from "react-native"
import fonts from "@/constants/fonts"
import { colors } from "@/constants/colors"
import ButtonStandart from "@/components/buttons/button-standart"
import { router } from "expo-router"

export function ProfileMomentEmpty({
    username,
    isAccount,
}: {
    username: string
    isAccount: boolean
}) {
    const { t } = React.useContext(LanguageContext)

    const container: ViewStyle = {
        maxWidth: sizes.screens.width * 0.9,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["1md"] * 1.2,
        backgroundColor: colors.gray.grey_08,
        borderRadius: sizes.borderRadius["1lg"],
    }
    const title: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family.Black,
        color: colors.gray.white,
        textAlign: "center",
    }
    const buttonText: TextStyle = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family["Black-Italic"],
        color: colors.gray.black,
        textAlign: "center",
    }
    const description: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        textAlign: "center",
        marginTop: sizes.margins["2sm"],
    }

    if (isAccount) {
        return (
            <View style={container}>
                <Text style={title}>{t("Nothing to show for now")} 🥲</Text>
                <Text style={description}>
                    {t("It seems that you hasn't shared anything in the last 30 days.")}
                </Text>
                <ButtonStandart
                    action={() => {
                        router.navigate("(tabs)/create")
                    }}
                    margins={false}
                    backgroundColor={colors.gray.white}
                    style={{
                        minWidth: sizes.buttons.width * 0.5,
                        marginTop: sizes.margins["1md"] * 1.1,
                    }}
                >
                    <Text style={buttonText}>{t("Share Moment")}</Text>
                </ButtonStandart>
            </View>
        )
    } else {
        ;<View style={container}>
            <Text style={title}>{t("Nothing to show for now")} 🥲</Text>
            <Text style={description}>
                {t("It seems that")} @{username} {t("hasn't shared anything in the last 30 days.")}
            </Text>
        </View>
    }
}
