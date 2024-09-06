import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Text, View } from "react-native"
import Camera from "../../../assets/icons/svgs/plus_circle.svg"
import SearchIcon from "../../../assets/icons/svgs/search.svg"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import ButtonStandart from "../../buttons/button-standart"

export default function HeaderRightHome() {
    const { t } = React.useContext(LanguageContext)

    const navigation = useNavigation()

    const container: any = {
        flexDirection: "row",
    }

    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text,
    }
    const textContainer = {
        marginRight: sizes.margins["2sm"],
    }

    async function onPressNewMoment() {
        navigation.navigate("MomentNavigator", {
            screen: "NewMomentImageScreen",
        })
    }

    async function onPressSearch() {
        navigation.navigate("ExploreNavigator", { screen: "ExploreScreen" })
    }

    return (
        <View style={container}>
            <ButtonStandart
                action={onPressNewMoment}
                width={90}
                backgroundColor={String(ColorTheme().backgroundDisabled)}
            >
                <View style={textContainer}>
                    <Text style={text}>{t("Create")}</Text>
                </View>
                <Camera fill={String(ColorTheme().text)} width={16} height={16} />
            </ButtonStandart>

            <ButtonStandart
                action={onPressSearch}
                backgroundColor={String(ColorTheme().backgroundDisabled)}
            >
                <SearchIcon fill={String(ColorTheme().text)} width={18} height={18} />
            </ButtonStandart>
        </View>
    )
}
