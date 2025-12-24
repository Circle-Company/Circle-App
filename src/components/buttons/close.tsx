import Close from "@/assets/icons/svgs/close.svg"
import { useRouter } from "expo-router"
import React from "react"
import { Platform, TouchableOpacity } from "react-native"
import ColorTheme, { colors } from "../../constants/colors"
import { Host, Button as SwiftButton } from "@expo/ui/swift-ui"
import { isIOS } from "@/lib/platform/detection"
import { Pressable } from "react-native"

type ButtonCloseProps = {
    transparent?: boolean
    iconColor?: string
    backgroundColor?: string
    testID?: any
    onPress?: () => void
}

export default function ButtonClose({
    transparent = false,
    backgroundColor = String(ColorTheme().backgroundDisabled),
    iconColor = String(ColorTheme().icon),
    testID,
    onPress,
}: ButtonCloseProps) {
    const router = useRouter()
    const container: any = {
        backgroundColor: transparent == true ? "#12121D30" : backgroundColor,
        width: 35,
        height: 35,
        borderRadius: 50,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
    }

    return (
        <Pressable
            onPress={() => {
                onPress ? onPress() : router.back()
            }}
            style={container}
            testID={testID}
        >
            <Close fill={iconColor} width={12} height={12} />
        </Pressable>
    )
}
