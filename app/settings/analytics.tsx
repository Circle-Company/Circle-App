import React from "react"
import { Text, TextStyle, View, ViewStyle } from "react-native"

import { SwitchButton } from "@/components/general/switch-button"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { hasAnalyticsConsent, setAnalyticsConsent } from "@/lib/trackEvent"

/**
 * Consentimento de analytics. O app tem usuários em regiões que exigem
 * consentimento explícito, então o SDK do Mixpanel só inicializa depois que
 * este switch é ligado — e desligá-lo derruba a instância e chama `reset()`.
 *
 * Revogar precisa ser tão fácil quanto conceder; é por isso que o controle mora
 * nas configurações e não só num prompt de primeira execução.
 */
export default function AnalyticsScreen() {
    const { t } = React.useContext(LanguageContext)
    const [granted, setGranted] = React.useState(() => hasAnalyticsConsent())

    function apply(next: boolean) {
        setAnalyticsConsent(next)
        setGranted(next)
    }

    const title: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family["Bold"],
        color: colors.gray.white,
    }

    const container: ViewStyle = {
        marginHorizontal: sizes.margins["1md"],
        paddingHorizontal: sizes.paddings["1md"] * 1.3,
        paddingVertical: sizes.paddings["2sm"] * 1.3,
        borderRadius: sizes.borderRadius["1md"] * 1.5,
        backgroundColor: colors.gray.grey_08,
        marginBottom: sizes.margins["1md"],
        alignItems: "flex-start",
        justifyContent: "flex-start",
        flexDirection: "row",
    }

    const description: TextStyle = {
        marginTop: sizes.margins["2sm"],
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        textAlign: "left",
    }

    return (
        <View style={container}>
            <View style={{ width: "80%", paddingRight: sizes.paddings["1sm"], height: "100%" }}>
                <Text style={title}>{t("Usage analytics")}</Text>
                <Text style={description}>
                    {t(
                        "Allow Circle to collect anonymous usage data to understand how the app is used and improve it. Turning this off stops all collection.",
                    )}
                </Text>
            </View>
            <View style={{ width: "20%", alignSelf: "center", alignItems: "center" }}>
                <SwitchButton
                    initialState={granted}
                    onPressEnable={() => apply(true)}
                    onPressDisable={() => apply(false)}
                />
            </View>
        </View>
    )
}
