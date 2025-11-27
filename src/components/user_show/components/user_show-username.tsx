import ColorTheme, { colors } from "../../../constants/colors"
import { Pressable, Text, View, useColorScheme } from "react-native"

import Icon from "@/assets/icons/svgs/@2.svg"
import LanguageContext from "../../../contexts/Preferences/language"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import Sizes from "../../../constants/sizes"
import { UserUsernameProps } from "../user_show-types"
import Verifyed from "@/assets/icons/svgs/check_circle_verify.svg"
import fonts from "../../../constants/fonts"
import { truncated } from "../../../helpers/processText"
import { useNavigation } from "@react-navigation/native"
import { useUserShowContext } from "../user_show-context"

export default function UserShowUsername({
    pressable = true,
    displayOnMoment = true,
    truncatedSize = 30,
    displayYou = true,
    color = ColorTheme().text,
    fontSize = fonts.size.footnote,
    fontFamily = fonts.family.Bold,
    margin = Sizes.margins["1sm"],
    scale = 1,
}: UserUsernameProps) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const { user, executeBeforeClick } = useUserShowContext()
    const isDarkMode = useColorScheme() === "dark"
    const navigation: any = useNavigation()

    const isMe = user.id == session.user.id ? true : false

    const container: any = {
        margin: margin * scale,
        flexDirection: "row",
        alignItems: "center",
    }
    const username_style_moment: any = {
        fontSize: fontSize * scale,
        fontFamily,
        color: colors.gray.white,
        textShadowColor: "#00000070",
        textShadowOffset: { width: 0.3, height: 0.7 },
        textShadowRadius: 4,
        letterSpacing: -0.7,
    }

    const username_style: any = {
        fontSize: fontSize * scale,
        fontFamily,
        color,
    }

    const icon_style = {
        top: 2,
        marginRight: 1 * scale,
    }

    async function onUsernameAction() {
        if (pressable) {
            executeBeforeClick ? executeBeforeClick() : null
            await navigation.navigate("ProfileNavigator", {
                screen: "Profile",
                params: { findedUserPk: user.id },
            })
        }
    }

    const username = `${truncated({ text: user.username, size: Number(truncatedSize) })}`
    const usernameText = displayYou ? (isMe ? t("You") : username) : username
    return (
        <Pressable onPress={async () => await onUsernameAction()} style={container}>
            {displayYou ? (
                isMe ? null : (
                    <Icon style={icon_style} width={12 * scale} height={12 * scale} fill={color} />
                )
            ) : (
                <Icon style={icon_style} width={12 * scale} height={12 * scale} fill={color} />
            )}
            <Text style={displayOnMoment ? username_style_moment : username_style}>
                {usernameText}
            </Text>
            {user.verified && (
                <View
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1 * scale * 2,
                        marginLeft: 2 * scale,
                    }}
                >
                    <Verifyed
                        fill={String(
                            displayOnMoment
                                ? colors.gray.white
                                : isDarkMode
                                ? colors.yellow.yellow_04
                                : colors.yellow.yellow_05,
                        )}
                        width={12 * scale}
                        height={12 * scale}
                    />
                </View>
            )}
        </Pressable>
    )
}
