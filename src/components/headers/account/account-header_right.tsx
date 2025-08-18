import Cog from "@/assets/icons/svgs/cog.svg"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View, ViewStyle } from "react-native"
import ColorTheme from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import ButtonStandart from "../../buttons/button-standart"

export default function AccountHeaderRight() {
    const navigation = useNavigation()

    const container: ViewStyle = {
        flexDirection: "row",
        marginRight: sizes.margins["3sm"],
    }

    return (
        <View style={container}>
            <ButtonStandart
                square
                margins={false}
                action={() => navigation.navigate("SettingsNavigator")}
            >
                <Cog fill={String(ColorTheme().text)} width={22} height={22} />
            </ButtonStandart>
        </View>
    )
}
