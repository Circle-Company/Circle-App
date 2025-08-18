import ArrowLeft from "@/assets/icons/svgs/arrow_left.svg"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../constants/colors"
import HeaderButton from "../headerButton"

export default function MemoryHeaderLeft() {
    const navigation = useNavigation()

    const container: any = {
        flexDirection: "row",
    }

    return (
        <View style={container}>
            <HeaderButton action={() => navigation.goBack()} marginLeft square>
                <ArrowLeft fill={String(ColorTheme().text)} width={18} height={18} />
            </HeaderButton>
        </View>
    )
}
