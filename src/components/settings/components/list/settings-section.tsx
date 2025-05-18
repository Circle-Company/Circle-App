import { FlatList, View, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../../layout/constants/colors"
import { Text, TextStyle, ViewStyle } from "../../../Themed"
import { SettignsSectionProps, SettingsiItemObjectProps } from "../../settings-types"

import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"
import SettingsItem from "./settings-item"

export default function SettingsSection({ name, content }: SettignsSectionProps) {
    const isDarkMode = useColorScheme() === "dark"

    const container: ViewStyle = {
        width: sizes.screens.width,
        marginBottom: sizes.paddings["2sm"],
    }

    const header_container: ViewStyle = {
        height: sizes.sizes["2md"],
        width: sizes.screens.width - sizes.paddings["1sm"],
        marginHorizontal: sizes.paddings["1sm"] * 0.5,
        paddingHorizontal: sizes.paddings["2sm"],
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderRadius: sizes.borderRadius["1sm"],
    }
    const header_text: TextStyle = {
        fontSize: fonts.size.caption1 * 1.05,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().primary,
    }
    const content_container: ViewStyle = {
        width: sizes.screens.width,
    }

    return (
        <View style={container}>
            <View style={header_container}>
                <Text style={header_text}>{name}</Text>
            </View>
            <View style={content_container}>
                <FlatList<SettingsiItemObjectProps>
                    data={content as SettingsiItemObjectProps[]}
                    renderItem={({ item }) => (
                        <SettingsItem
                            icon={item.icon}
                            type={item.type}
                            value={item.value}
                            navigator=""
                            name={item.name}
                            navigateTo={item.navigateTo}
                            secure={item.secure}
                        />
                    )}
                />
            </View>
        </View>
    )
}
