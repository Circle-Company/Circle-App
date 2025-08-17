import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import ArrowLeft from "../../../assets/icons/svgs/arrow_left.svg"
import ColorTheme from "../../../layout/constants/colors"
import HeaderButton from "../headerButton"

export default function MemoriesHeaderLeft() {
    const navigation = useNavigation()

    return (
        <View style={{ flexDirection: "row" }}>
            <HeaderButton action={() => navigation.goBack()} marginLeft square>
                <ArrowLeft fill={String(ColorTheme().text)} width={18} height={18} />
            </HeaderButton>
        </View>
    )
}
