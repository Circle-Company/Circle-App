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
import MomentContext from "@/components/moment/context"
import { textLib } from "@/shared/circle.text.library"
import { truncated } from "@/helpers/processText"
export default function ZeroComments() {
    const { t } = React.useContext(LanguageContext)
    const { commentEnabled, setCommentEnabled, setKeyboardVisible, setScrollEnabled } =
        React.useContext(FeedContext)
    const { momentData } = React.useContext(MomentContext)
    const isDarkMode = useColorScheme() === "dark"
    const container: any = {
        maxWidth: sizes.screens.width,
        borderRadius: sizes.borderRadius["1md"] * 1.2,
        backgroundColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: sizes.paddings["1md"],
        paddingBottom: sizes.paddings["2sm"],
        paddingTop: sizes.paddings["1sm"],
    }

    const buttonContainer: ViewStyle = {
        alignSelf: "center",
        alignItems: "center",
        maxWidth: sizes.buttons.width * 0.8,
        height: sizes.buttons.height * 0.5,
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: colors.gray.white,
    }

    const buttonTitle: any = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body * 1.1,
        color: colors.gray.black,
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
                    {momentData.created_at && (
                        <Text
                            style={{
                                fontSize: fonts.size.caption1,
                                color: ColorTheme().textDisabled,
                            }}
                        >
                            {t("Shared")}{" "}
                            {textLib.date
                                .toRelativeTime(new Date(momentData.created_at))
                                .toLowerCase()}
                        </Text>
                    )}
                    <Text
                        style={{
                            fontFamily: fonts.family.Bold,

                            fontSize: fonts.size.subheadline * 0.85,
                        }}
                    >
                        {t("It seems like nobody has commented yet")} 🥲
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
                    <Text style={buttonTitle}>
                        {t("React to")} @
                        {textLib.conversor.sliceWithDots({
                            text: momentData.user.username,
                            size: 10,
                        })}
                    </Text>
                </ButtonStandart>
            </View>
        )
}
