import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { ViewersZeroViewersProps } from "../viewers-types"

/**
 * Lista vazia é resposta normal (moment recém-publicado) — estado vazio, nunca
 * erro. `code` preenchido vem do envelope de erro do backend.
 */
export default function ZeroViewers({ code }: ViewersZeroViewersProps) {
    const { t } = React.useContext(LanguageContext)

    const container: ViewStyle = {
        width: "100%",
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["1lg"] * 0.8,
        paddingHorizontal: sizes.paddings["1md"],
        borderRadius: sizes.borderRadius["1lg"] * 1.2,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const title: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family.Bold,
        fontStyle: "italic",
        marginBottom: sizes.margins["2sm"],
        textAlign: "center",
    }

    const description: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        textAlign: "center",
        paddingHorizontal: sizes.paddings["1md"],
    }

    if (code === "FORBIDDEN" || code === "INSUFFICIENT_PERMISSION") {
        return (
            <View style={container}>
                <Text style={title}>{t("This list is private")} 🔒</Text>
                <Text style={description}>
                    {t("Only the author of a moment can see who watched it.")}
                </Text>
            </View>
        )
    }

    if (code === "NOT_FOUND") {
        return (
            <View style={container}>
                <Text style={title}>{t("Moment not found")}</Text>
                <Text style={description}>{t("It may have been deleted.")}</Text>
            </View>
        )
    }

    if (code) {
        return (
            <View style={container}>
                <Text style={title}>{t("Something went wrong")}</Text>
                <Text style={description}>{t("Pull down to try again.")}</Text>
            </View>
        )
    }

    return (
        <View style={container}>
            <Text style={title}>{t("No one has watched it yet")} 👀</Text>
            <Text style={description}>
                {t("When someone watches this moment, they will show up here.")}
            </Text>
        </View>
    )
}
