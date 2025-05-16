import { Pressable, View, useColorScheme } from "react-native"
import { SettingsiItemObjectProps } from "../../settings-types"
import { Text } from "../../../Themed"
import { useNavigation } from "@react-navigation/native"
import sizes from "../../../../layout/constants/sizes"
import { colors } from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import ChevronRight from "../../../../assets/icons/svgs/chevron_right.svg"

export default function item({ name, navigateTo }: SettingsiItemObjectProps) {
    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === "dark"

    const icon_fill: string = isDarkMode ? String(colors.gray.grey_06) : String(colors.gray.grey_03)

    const container: any = {
        width: sizes.screens.width,
        height: sizes.sizes["3md"],
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
    }
    const container_left: any = {
        paddingLeft: sizes.paddings["1sm"],
        alignItems: "flex-start",
        flex: 1,
    }
    const container_right: any = {
        paddingLeft: 2,
        alignItems: "center",
        width: sizes.screens.width / 8,
    }

    const text_style: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
    }

    return (
        <Pressable
            style={container}
            onPress={() => {
                navigation.navigate("SettingsNavigator", { screen: navigateTo })
            }}
        >
            <View style={container_left}>
                <Text style={text_style}>{name}</Text>
            </View>
            <View style={container_right}>
                <ChevronRight fill={icon_fill} width={16} height={16} />
            </View>
        </Pressable>
    )
}
