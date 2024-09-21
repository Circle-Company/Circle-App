import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Pressable, View, useColorScheme } from "react-native"
import TouchID from "react-native-simple-biometrics"
import ChevronRight from "../../../../assets/icons/svgs/chevron_right.svg"
import PersistedContext from "../../../../contexts/Persisted"
import LanguageContext from "../../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"
import { Text } from "../../../Themed"
import { UserShow } from "../../../user_show"
import { SettingsiItemAccountObjectProps } from "../../settings-types"

export default function item({
    name,
    value,
    type,
    icon,
    navigateTo,
    secure,
}: SettingsiItemAccountObjectProps) {
    const navigation: any = useNavigation()
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const { session } = React.useContext(PersistedContext)

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
        flexDirection: "row",
    }
    const container_right: any = {
        flexDirection: "row",
        paddingRight: sizes.paddings["1md"] * 0.7,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    }
    const text_style: any = {
        textAlign: "right",
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
    }

    const value_container: any = {
        flex: 1,
        alignItems: "flex-end",
        marginRight: sizes.margins["2sm"],
    }

    const value_style: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }

    async function handlePress() {
        if (secure) {
            const isAuthenticated = await TouchID.requestBioAuth(
                t("Make sure it's you"),
                t("You're changing your password")
            )
            if (isAuthenticated) navigation.navigate("SettingsNavigator", { screen: navigateTo })
        } else navigation.navigate("SettingsNavigator", { screen: navigateTo })
    }

    return (
        <Pressable style={container} onPress={handlePress}>
            <View style={container_left}>
                {icon && <View style={{ marginRight: sizes.margins["3sm"] }}>{icon}</View>}

                <Text style={text_style}>{name}</Text>
            </View>
            <View style={container_right}>
                {type == "IMAGE" ? (
                    <View style={[value_container, { marginRight: 6 }]}>
                        <UserShow.Root data={session.user}>
                            <UserShow.ProfilePicture
                                displayOnMoment={false}
                                pictureDimensions={{ width: 22, height: 22 }}
                                disableAnalytics={true}
                            />
                        </UserShow.Root>
                    </View>
                ) : (
                    <View style={value_container}>
                        <Text style={value_style}>{value}</Text>
                    </View>
                )}
                <View>
                    <ChevronRight fill={icon_fill} width={16} height={16} />
                </View>
            </View>
        </Pressable>
    )
}
