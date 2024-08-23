import { FlatList, View, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"
import { Text } from "../../../Themed"
import { SettignsSectionProps, SettingsiItemAccountObjectProps } from "../../settings-types"
import SettingsItem from "./settings-item"
import SettingsItemAccount from "./settings-item-account"

export default function section({ name, type, content }: SettignsSectionProps) {
    const isDarkMode = useColorScheme() === "dark"

    const container: any = {
        width: sizes.screens.width,
    }

    const header_container: any = {
        height: sizes.sizes["2md"],
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings["1sm"],
        alignItems: "flex-start",
        justifyContent: "center",
        borderBottomWidth: 1,
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
    }
    const header_text: any = {
        fontSize: fonts.size.caption1 * 1.05,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().primary,
    }
    const content_container: any = {
        width: sizes.screens.width,
    }

    return (
        <View style={container}>
            <View style={header_container}>
                <Text style={header_text}>{name.toUpperCase()}</Text>
            </View>
            <View style={content_container}>
                {type == "ACCOUNT" ? (
                    <FlatList
                        data={content}
                        renderItem={({
                            item,
                            index,
                        }: {
                            item: SettingsiItemAccountObjectProps
                            index: number
                        }) => {
                            return (
                                <SettingsItemAccount
                                    key={index}
                                    type={item.type}
                                    value={item.value}
                                    navigator=""
                                    name={item.name}
                                    navigateTo={item.navigateTo}
                                    secure={item.secure}
                                />
                            )
                        }}
                    />
                ) : (
                    <FlatList
                        data={content}
                        renderItem={({ item }) => {
                            return <SettingsItem name={item.name} navigateTo={item.navigateTo} />
                        }}
                    />
                )}
            </View>
        </View>
    )
}
