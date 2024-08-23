import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import SearchIcon from "../../../assets/icons/svgs/search.svg"
import LanguageContext from "../../../contexts/Preferences/language"
import SelectMomentsContext from "../../../contexts/selectMoments"
import ColorTheme from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import ButtonStandart from "../../buttons/button-standart"

export default function AccountHeaderLeft() {
    const { t } = React.useContext(LanguageContext)
    const { setFrom } = React.useContext(SelectMomentsContext)
    const navigation = useNavigation()

    const container: any = {
        flexDirection: "row",
        marginLeft: sizes.margins["3sm"],
    }
    function handlePress() {
        setFrom("NEW_MEMORY")
        navigation.navigate("InboxNavigator", { screen: "Inbox" })
    }

    return (
        <View style={container}>
            <ButtonStandart
                action={handlePress}
                margins={false}
                backgroundColor={String(ColorTheme().backgroundDisabled)}
            >
                <SearchIcon fill={String(ColorTheme().text)} width={18} height={18} />
            </ButtonStandart>
        </View>
    )
}
