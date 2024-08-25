import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import Icon from "../../../assets/icons/svgs/close_bold.svg"
import ColorTheme from "../../../layout/constants/colors"
import HeaderButton from "../headerButton"

export default function HeaderLeft() {
    const navigation = useNavigation()

    const container: any = {
        flexDirection: "row",
    }

    return (
        <View style={container}>
            <HeaderButton
                action={() => navigation.goBack()}
                marginLeft
                color={String(ColorTheme().backgroundDisabled)}
            >
                <Icon fill={String(ColorTheme().text)} width={13} height={13} />
            </HeaderButton>
        </View>
    )
}
