import { SwitchButton } from "@/components/general/switch-button"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { useRouter } from "expo-router"
import React from "react"
import { TextStyle, ViewStyle, View, Text } from "react-native"

export default function ContentScreen() {
    const router = useRouter()
    const { t } = React.useContext(LanguageContext)

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
                <Text style={title}>{t("Content warning filter")}</Text>
                <Text style={description}>
                    {t(
                        "The content warning filter is for your protection. It will help you avoid viewing potentially inappropriate content.",
                    )}
                </Text>
            </View>
            <View
                style={{
                    width: "20%",
                    alignSelf: "center",
                    alignItems: "center",
                }}
            >
                <SwitchButton
                    initialState={false}
                    onPressDisable={() => {}}
                    onPressEnable={() => {}}
                />
            </View>
        </View>
    )
}
