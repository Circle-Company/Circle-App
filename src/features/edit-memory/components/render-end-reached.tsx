import ColorTheme, { colors } from "@/layout/constants/colors"
import { View, ViewStyle, useColorScheme } from "react-native"

import ButtonStandart from "@/components/buttons/button-standart"
import { Text } from "@/components/Themed"
import LanguageContext from "@/contexts/Preferences/language"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"
import React from "react"

export default function RenderEndReached({ text }: { text: string }) {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    
    const styles = {
        container: {
            alignItems: "center",
            justifyContent: "center",
            marginBottom: sizes.paddings["1sm"],
        } as ViewStyle,
        button: {
            width: sizes.buttons.width * 0.6,
            height: sizes.buttons.height * 0.6,
            marginHorizontal: sizes.paddings["1sm"],
            backgroundColor: ColorTheme().primary.toString(),
        },
        buttonText: {
            fontSize: fonts.size.body * 0.9,
            fontFamily: fonts.family["Bold-Italic"],
            color: colors.gray.white,
        },
        title: {
            color: isDarkMode ? colors.gray.white : colors.gray.black,
            fontSize: fonts.size.caption1,
            fontFamily: fonts.family.Medium,
            marginBottom: sizes.paddings["1sm"],
        },
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("No more Moments to add")}</Text>
            <ButtonStandart
                animationScale={0.92}
                margins={false}
                backgroundColor={styles.button.backgroundColor}
                action={() => {}}
            >
                <Text style={styles.buttonText}>{t(text)}</Text>
            </ButtonStandart>
        </View>
    )
}