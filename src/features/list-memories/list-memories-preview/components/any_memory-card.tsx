import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Image, useColorScheme } from "react-native"
import NewMoment from "../../../../assets/icons/svgs/memory.svg"
import { Text, View } from "../../../../components/Themed"
import HeaderButton from "../../../../components/headers/headerButton"
import LanguageContext from "../../../../contexts/Preferences/language"
import SelectMomentsContext from "../../../../contexts/selectMoments"
import ViewProfileContext from "../../../../contexts/viewProfile"
import ColorTheme, { colors } from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"

type AnyMemoryCardProps = {
    isAccountScreen?: boolean
}

export default function AnyMemoryCard({ isAccountScreen = false }: AnyMemoryCardProps) {
    const { userProfile } = React.useContext(ViewProfileContext)
    const { t } = React.useContext(LanguageContext)
    const { setFrom } = React.useContext(SelectMomentsContext)
    const navigation = useNavigation() as any
    const isDarkMode = useColorScheme() === "dark"

    function handlePress() {
        setFrom("NEW_MEMORY")
        navigation.navigate("MemoriesNavigator", { screen: "NewMemorySelectMoments" })
    }

    const container: any = {
        alignSelf: "center",
        borderRadius: sizes.borderRadius["1md"],
        marginTop: sizes.margins["1sm"],
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        paddingHorizontal: sizes.paddings["2sm"],
        paddingVertical: sizes.paddings["1md"],
    }

    const title: any = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text,
        textAlign: "center",
        marginHorizontal: sizes.margins["2sm"],
        marginBottom: sizes.margins["2sm"],
    }
    const subtitle: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        textAlign: "center",
        marginHorizontal: sizes.margins["2sm"],
        marginBottom: sizes.margins["1lg"],
    }
    const text: unknown = {
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
            <Image
                source={require("../../../../assets/images/illustrations/Memory-Illustration.png")}
                resizeMode="contain"
                style={{ width: 160, height: 160, marginBottom: sizes.margins["1sm"] }}
            />
            <Text style={title}>Create your first memory</Text>
            <Text style={subtitle}>{titleText}</Text>
            {isAccountScreen && (
                <HeaderButton
                    action={handlePress}
                    marginLeft={false}
                    color={ColorTheme().primary.toString()}
                    marginRight={false}
                >
                    <Text style={text}>{t("New Memory")}</Text>
                    <NewMoment fill={colors.gray.white.toString()} width={16} height={16} />
                </HeaderButton>
            )}
        </View>
    )
}
