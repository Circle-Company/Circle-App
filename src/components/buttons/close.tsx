import Close from "../../assets/icons/svgs/close.svg"
import ColorTheme from "../../layout/constants/colors"
import React from "react"
import { TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"

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
    const navigation = useNavigation()
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
        <TouchableOpacity
            style={container}
            onPress={() => {
                onPress ? onPress() : navigation.goBack()
            }}
            testID={testID}
        >
            <Close fill={iconColor} width={12} height={12} />
        </TouchableOpacity>
    )
}
