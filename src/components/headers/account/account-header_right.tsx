import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import Cog from "../../../assets/icons/svgs/cog.svg"
import LanguageContext from "../../../contexts/Preferences/language"
import SelectMomentsContext from "../../../contexts/selectMoments"
import ColorTheme from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import ButtonStandart from "../../buttons/button-standart"

export default function AccountHeaderRight() {
    const { t } = React.useContext(LanguageContext)
    const { setFrom } = React.useContext(SelectMomentsContext)
    const navigation = useNavigation()

    const container: any = {
        flexDirection: "row",
        marginRight: sizes.margins["3sm"],
    }

    return (
        <View style={container}>
            <ButtonStandart margins={false} action={() => navigation.navigate("SettingsNavigator")}>
                <Cog fill={String(ColorTheme().text)} width={22} height={22} />
            </ButtonStandart>
        </View>
    )
}
