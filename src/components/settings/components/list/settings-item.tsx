import ChevronRight from "@/assets/icons/svgs/chevron_right.svg"
import { SettingsiItemObjectProps } from "@/components/settings/settings-types"
import { Text } from "@/components/Themed"
import { UserShow } from "@/components/user_show"
import { userReciveDataProps } from "@/components/user_show/user_show-types"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import PersistedContext from "@/contexts/Persisted"
import LanguageContext from "@/contexts/Preferences/language"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import * as LocalAuthentication from "expo-local-authentication"
import React from "react"
import { Pressable, TextStyle, View, ViewStyle, useColorScheme } from "react-native"

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

    const iconFill = isDarkMode ? colors.gray.grey_06 : colors.gray.grey_03

    const styles = {
        container: {
            width: sizes.screens.width - sizes.paddings["1sm"] * 2,
            marginHorizontal: sizes.paddings["1sm"],
            height: sizes.sizes["3md"],
            alignItems: "center" as const,
            justifyContent: "flex-start" as const,
            flexDirection: "row" as const,
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
            fontFamily: fonts.family.Semibold,
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
            marginRight: 6,
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
                            data={{ ...session.user, you_follow: false } as userReciveDataProps}
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
