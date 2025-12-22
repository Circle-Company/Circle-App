import * as LocalAuthentication from "expo-local-authentication"

import ColorTheme, { colors } from "@/constants/colors"
import { Pressable, TextStyle, View, ViewStyle, useColorScheme } from "react-native"

import ChevronRight from "@/assets/icons/svgs/chevron_right.svg"
import LanguageContext from "@/contexts/Preferences/language"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import { SettingsiItemObjectProps } from "@/components/settings/settings-types"
import { Text } from "@/components/Themed"
import { UserShow } from "@/components/user_show"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { useNavigation } from "@react-navigation/native"
import { userReciveDataProps } from "@/components/user_show/user_show-types"

type SettingsNavigatorParamList = {
    SettingsNavigator: { screen: string }
}

type NavigationProp = NativeStackNavigationProp<SettingsNavigatorParamList>

export default function SettingsItem({
    name,
    value,
    type,
    icon,
    navigateTo,
    secure,
}: SettingsiItemObjectProps) {
    const navigation = useNavigation<NavigationProp>()
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const { session } = React.useContext(PersistedContext)

    const iconFill = colors.gray.grey_06

    const styles = {
        container: {
            width: sizes.screens.width - sizes.paddings["2sm"] * 2,
            marginHorizontal: sizes.paddings["2sm"],
            height: sizes.sizes["3md"],
            alignItems: "center" as const,
            justifyContent: "flex-start" as const,
            flexDirection: "row" as const,
            borderRadius: sizes.borderRadius["1sm"] * 1.4,
            marginBottom: sizes.margins["1sm"],
            backgroundColor: colors.gray.grey_09,
        } as ViewStyle,
        containerLeft: {
            paddingLeft: sizes.paddings["1sm"],
            alignItems: "flex-start" as const,
            flexDirection: "row" as const,
        } as ViewStyle,
        containerRight: {
            flexDirection: "row" as const,
            paddingRight: sizes.paddings["1md"] * 0.7,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            flex: 1,
        } as ViewStyle,
        textStyle: {
            textAlign: "right" as const,
            fontSize: fonts.size.body,
            opacity: 0.8,
            fontFamily: fonts.family.Semibold,
            marginLeft: sizes.margins["2sm"] * 0.8,
        } as TextStyle,
        valueContainer: {
            flex: 1,
            alignItems: "flex-end" as const,
            marginRight: sizes.margins["2sm"],
        } as ViewStyle,
        valueStyle: {
            fontSize: fonts.size.body * 0.9,
            fontFamily: fonts.family.Medium,
            color: ColorTheme().textDisabled,
        } as TextStyle,
        iconContainer: {
            marginRight: sizes.margins["3sm"],
            width: 20,
            height: 20,
            justifyContent: "center" as const,
            alignItems: "center" as const,
        } as ViewStyle,
        valueContainerImage: {
            flex: 1,
            alignItems: "flex-end" as const,
            marginRight: sizes.margins["1md"],
        } as ViewStyle,
    }

    const handlePress = async () => {
        if (secure) {
            const isAuthenticated = await LocalAuthentication.authenticateAsync({
                biometricsSecurityLevel: "weak",
                promptMessage: t("You're changing your password"),
            })
            if (isAuthenticated) {
                navigation.navigate("SettingsNavigator", { screen: navigateTo })
            }
        } else {
            navigation.navigate("SettingsNavigator", { screen: navigateTo })
        }
    }

    return (
        <Pressable style={styles.container} onPress={handlePress}>
            <View style={styles.containerLeft}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text style={styles.textStyle}>{name}</Text>
            </View>
            <View style={styles.containerRight}>
                {type === "IMAGE" ? (
                    <View style={styles.valueContainerImage}>
                        <UserShow.Root
                            data={
                                {
                                    ...session.user,
                                    youFollow: false,
                                    verified: false,
                                } as unknown as userReciveDataProps
                            }
                        >
                            <UserShow.ProfilePicture
                                displayOnMoment={false}
                                pictureDimensions={{ width: 22, height: 22 }}
                            />
                        </UserShow.Root>
                    </View>
                ) : (
                    <View style={styles.valueContainer}>
                        <Text style={styles.valueStyle}>{String(value)}</Text>
                    </View>
                )}
                <View>
                    <ChevronRight fill={String(iconFill)} width={16} height={16} />
                </View>
            </View>
        </Pressable>
    )
}
