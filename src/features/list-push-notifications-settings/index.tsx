import { View, useColorScheme } from "react-native"
import { Text, TextStyle, ViewStyle } from "../../components/Themed"
import ColorTheme, { colors } from "../../layout/constants/colors"

import fonts from "../../layout/constants/fonts"
import sizes from "../../layout/constants/sizes"

interface ListPushNotificationsSettingsProps {
    title: string
    description: string
    leftComponent: React.ReactNode
}
export function ListPushNotificationsSettings({
    leftComponent,
    title,
    description,
}: ListPushNotificationsSettingsProps) {
    const isDarkMode = useColorScheme() === "dark"
    const container: ViewStyle = {
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        borderBottomWidth: 1,
        paddingVertical: sizes.paddings["1md"],
        paddingLeft: sizes.paddings["1sm"],
        paddingRight: sizes.paddings["2md"],
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderRadius: sizes.borderRadius["1md"],
    }
    const container_left: ViewStyle = {
        paddingLeft: sizes.paddings["1sm"],
        alignItems: "flex-start",
        flex: 1,
    }
    const container_right: ViewStyle = {
        paddingLeft: 2,
        alignItems: "center",
        width: sizes.screens.width / 8,
    }

    const title_style: TextStyle = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family.Bold,
    }

    const description_style: TextStyle = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        marginRight: sizes.margins["1md"],
    }

    return (
        <View style={container}>
            <View style={container_left}>
                <Text style={title_style}>{title}</Text>
                <Text style={description_style}>{description}</Text>
            </View>
            <View style={container_right}>{leftComponent}</View>
        </View>
    )
}
