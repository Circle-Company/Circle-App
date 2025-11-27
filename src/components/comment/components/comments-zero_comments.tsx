import ColorTheme, { colors } from "../../../constants/colors"
import { View, ViewStyle, useColorScheme } from "react-native"

import ButtonStandart from "../../buttons/button-standart"
import FeedContext from "../../../contexts/Feed"
import LanguageContext from "../../../contexts/Preferences/language"
import PlusIcon from "@/assets/icons/svgs/plus_circle.svg"
import React from "react"
import { Text } from "../../Themed"
import { Vibrate } from "../../../lib/hooks/useHapticFeedback"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
export default function ZeroComments() {
    const { t } = React.useContext(LanguageContext)
    const { commentEnabled, setCommentEnabled, setKeyboardVisible, setScrollEnabled } =
        React.useContext(FeedContext)
    const isDarkMode = useColorScheme() === "dark"
    const container: any = {
        width: sizes.screens.width * 0.7,
        flex: 1,
        borderRadius: sizes.borderRadius["1md"] * 1.2,
        backgroundColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: sizes.paddings["2sm"],
        paddingTop: sizes.paddings["1sm"],
    }

    const buttonContainer: ViewStyle = {
        alignSelf: "center",
        alignItems: "center",
        width: sizes.buttons.width * 0.5,
        height: sizes.buttons.height * 0.5,
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: isDarkMode ? colors.gray.grey_06 : colors.gray.grey_03,
    }

    const buttonTitle: any = {
        top: -1,
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.body * 0.9,
        marginRight: sizes.margins["1sm"],
    }
    function handlePress() {
        if (commentEnabled) {
            setCommentEnabled(false)
            setScrollEnabled(true)
            setKeyboardVisible(false)
        } else {
            setCommentEnabled(true)
            setKeyboardVisible(true)
            setScrollEnabled(true)
        }
    }

    if (commentEnabled) return null
    else
        return (
            <View style={container}>
                <View
                    style={{
                        marginBottom: sizes.margins["2sm"],
                        alignItems: "center",
                        alignSelf: "center",
                    }}
                >
                    <Text
                        style={{ fontSize: fonts.size.caption1, color: ColorTheme().textDisabled }}
                    >
                        {t("This Moment has no comments.")}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fonts.family.Semibold,

                            fontSize: fonts.size.subheadline * 0.85,
                        }}
                    >
                        {t("Be the first to comment.")}
                    </Text>
                </View>

                <ButtonStandart
                    action={handlePress}
                    vibrate={() => {
                        Vibrate("effectTick")
                    }}
                    margins={false}
                    bounciness={2}
                    style={buttonContainer}
                >
                    <Text style={buttonTitle}>{t("Add Comment")}</Text>
                    <PlusIcon
                        style={{ top: -0.5 }}
                        width={16}
                        height={16}
                        fill={ColorTheme().text}
                    />
                </ButtonStandart>
            </View>
        )
}
