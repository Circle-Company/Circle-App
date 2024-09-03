import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Text, View } from "../../../components/Themed"
import ButtonStandart from "../../../components/buttons/button-standart"
import { Loading } from "../../../components/loading"
import FeedContext from "../../../contexts/Feed"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export function EmptyList() {
    const { t } = React.useContext(LanguageContext)
    const { reloadFeed, loading } = React.useContext(FeedContext)
    const navigation = useNavigation()
    const container: any = {
        width: sizes.screens.width,
        height: sizes.screens.height - sizes.bottomTab.height,
        alignItems: "center",
        justifyContent: "center",
    }

    const buttonContainer: any = {
        paddingTop: sizes.paddings["1xl"],
        paddingBottom: sizes.paddings["2sm"],
    }
    const buttonText: any = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family["Bold-Italic"],
        color: colors.gray.white,
    }

    const messageText: any = {
        fontSize: fonts.size.body * 1.1,
        fontFamily: fonts.family.Medium,
    }

    const reloadText: any = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family.Medium,
        color: colors.blue.blue_05.toString(),
    }

    return (
        <View style={container}>
            <Text style={messageText}>{t("We don't have any Moment to show")} 🥹</Text>
            <View style={buttonContainer}>
                <ButtonStandart
                    animationScale={0.87}
                    width={sizes.buttons.width * 0.7}
                    height={sizes.buttons.height * 0.7}
                    margins={false}
                    backgroundColor={ColorTheme().primary.toString()}
                    action={() => {
                        navigation.navigate("MomentNavigator", { screen: "NewMomentImageScreen" })
                    }}
                >
                    <Text style={buttonText}>{t("Share a Moment")}</Text>
                </ButtonStandart>
            </View>

            {loading ? (
                <Loading.Container width={sizes.screens.width} height={40}>
                    <Loading.ActivityIndicator size={20} />
                </Loading.Container>
            ) : (
                <ButtonStandart
                    width={sizes.screens.width * 0.5}
                    margins={false}
                    animationScale={0.87}
                    backgroundColor="#00000000"
                    action={reloadFeed}
                >
                    <Text style={reloadText}>{t("Reload")}</Text>
                </ButtonStandart>
            )}
        </View>
    )
}
