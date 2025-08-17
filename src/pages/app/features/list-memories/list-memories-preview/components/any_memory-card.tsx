import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import React from "react"
import { Image, TextStyle, useColorScheme, ViewStyle } from "react-native"
import ButtonStandart from "../../../../../../components/buttons/button-standart"
import { Text, View } from "../../../../../../components/Themed"
import ColorTheme, { colors } from "../../../../../../constants/colors"
import fonts from "../../../../../../constants/fonts"
import sizes from "../../../../../../constants/sizes"
import LanguageContext from "../../../../../../contexts/Preferences/language"
import SelectMomentsContext from "../../../../../../contexts/selectMoments"
import ViewProfileContext from "../../../../../../contexts/viewProfile"

type RootStackParamList = {
    MemoriesNavigator: { screen: string }
}

type AnyMemoryCardProps = {
    isAccountScreen?: boolean
}

export default function AnyMemoryCard({ isAccountScreen = false }: AnyMemoryCardProps) {
    const { userProfile } = React.useContext(ViewProfileContext)
    const { t } = React.useContext(LanguageContext)
    const { setFrom } = React.useContext(SelectMomentsContext)
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
    const isDarkMode = useColorScheme() === "dark"

    function handlePress() {
        setFrom("NEW_MEMORY")
        navigation.navigate("MemoriesNavigator", { screen: "NewMemorySelectMoments" })
    }

    const container: ViewStyle = {
        alignSelf: "center",
        borderRadius: sizes.borderRadius["1md"],
        marginTop: sizes.margins["1sm"],
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        paddingHorizontal: sizes.paddings["2sm"],
        paddingVertical: isAccountScreen ? sizes.paddings["1md"] : sizes.paddings["2sm"],
    }

    const title: TextStyle = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text,
        textAlign: "center",
        marginHorizontal: sizes.margins["2sm"],
        marginBottom: sizes.margins["2sm"],
    }
    const subtitle: TextStyle = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        textAlign: "center",
        marginHorizontal: sizes.margins["2sm"],
        marginBottom: isAccountScreen ? sizes.margins["1lg"] : 0,
    }
    const text: TextStyle = {
        marginRight: sizes.margins["1sm"],
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white.toString(),
    }

    const username = userProfile ? `@${userProfile.username}` : t("This user")

    const titleText = isAccountScreen
        ? t("Crie memórias para começar mostrar seus momentos favoritos no seu perfil")
        : `${username} ${t("don't have any memory")}`

    return (
        <View style={container}>
            {isAccountScreen && (
                <>
                    <Image
                        source={require("@/assets/illustrations/Memory-Illustration.png")}
                        resizeMode="contain"
                        style={{ width: 160, height: 160, marginBottom: sizes.margins["1sm"] }}
                    />
                    <Text style={title}>Create your first memory</Text>
                </>
            )}
            <Text style={subtitle}>{titleText}</Text>
            {isAccountScreen && (
                <ButtonStandart
                    width={sizes.buttons.width * 0.5}
                    margins={false}
                    action={handlePress}
                    style={{ backgroundColor: ColorTheme().primary.toString() }}
                >
                    <Text style={text}>{t("New Memory")}</Text>
                </ButtonStandart>
            )}
        </View>
    )
}
