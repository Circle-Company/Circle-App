import ArrowLeft from "@/assets/icons/svgs/arrow_left.svg"
import { useRouter } from "expo-router"
import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../constants/colors"
import HeaderButton from "../headerButton"

export default function SettingsHeaderLeft() {
    const router = useRouter()

    const container: any = {
        flexDirection: "row",
    }

    return (
        <View style={container}>
            <HeaderButton action={() => router.back()} marginLeft square>
                <ArrowLeft fill={String(ColorTheme().text)} width={18} height={18} />
            </HeaderButton>
        </View>
    )
}
