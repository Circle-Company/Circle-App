import { View, ViewStyle } from "react-native"

import React from "react"
import { Text } from "../../../components/Themed"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function AnyMomentsWithoutInMemory() {
    const { t } = React.useContext(LanguageContext)

    const styles = {
        container: {
            width: sizes.screens.width - sizes.paddings["1md"] * 2,
            paddingVertical: sizes.paddings["1md"],
            paddingHorizontal: sizes.paddings["1md"],
            alignItems: "center" as const,
            justifyContent: "center" as const,
            borderRadius: sizes.borderRadius["1md"],
        } as ViewStyle,
        text: {
            fontSize: fonts.size.body,
            fontFamily: fonts.family.Regular,
            color: ColorTheme().text,
            textAlign: "center" as const,
        },
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{t("No moments available to add")}</Text>
        </View>
    )
} 