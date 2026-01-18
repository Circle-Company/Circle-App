import ColorTheme, { colors } from "../../../../constants/colors"
import { FlatList, View, useColorScheme } from "react-native"
import { SettignsSectionProps, SettingsiItemObjectProps } from "../../settings-types"
import { Text, TextStyle, ViewStyle } from "../../../Themed"

import SettingsItem from "./settings-item"
import fonts from "../../../../constants/fonts"
import sizes from "../../../../constants/sizes"
import { isIOS } from "@/lib/platform/detection"
import { Host, List, Label } from "@expo/ui/swift-ui"

import * as Browser from "expo-web-browser"

export default function SettingsSection({ name, content }: SettignsSectionProps) {
    const isDarkMode = useColorScheme() === "dark"

    const container: ViewStyle = {
        width: sizes.screens.width,
        marginBottom: sizes.paddings["2sm"],
    }

    const header_container: ViewStyle = {
        height: sizes.sizes["2md"],
        width: sizes.screens.width - sizes.paddings["1sm"],
        marginBottom: isIOS ? sizes.margins["1sm"] : sizes.margins["2sm"],
        marginLeft: sizes.paddings["2sm"] * 1.3,
        paddingHorizontal: sizes.paddings["2sm"],
        alignItems: "flex-start",
        justifyContent: "center",
    }
    const header_text: TextStyle = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white,
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
                            name={item.name}
                            secure={item.secure}
                            rightComponent={item.rightComponent}
                            onPress={async () => {
                                const v = item.value
                                if (typeof v === "string" && /^https?:\/\//i.test(v)) {
                                    await Browser.openBrowserAsync(v)
                                    return
                                }
                                if (item.onPress) {
                                    await item.onPress()
                                }
                            }}
                        />
                    )}
                />
            </View>
        </View>
    )
}
