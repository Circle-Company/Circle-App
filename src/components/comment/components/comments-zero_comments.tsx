import ColorTheme, { colors } from "../../../constants/colors"
import { View, ViewStyle } from "react-native"
import ButtonStandart from "../../buttons/button-standart"
import FeedContext from "../../../contexts/Feed"
import LanguageContext from "../../../contexts/language"
import React from "react"
import { Text } from "../../Themed"
import { Vibrate } from "../../../lib/hooks/useHapticFeedback"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import { textLib } from "@/circle.text.library"
import { Moment as MomentProps } from "@/contexts/Feed/types"
import { isIOS } from "@/lib/platform/detection"
import FetchedCommentsList from "./fetched-comments-list"
import BottomSheetContext from "@/contexts/bottomSheet"
import { UserShow } from "@/components/user_show"

export default function ZeroComments({
    moment,
    isAccount,
}: {
    moment: MomentProps
    isAccount: boolean
}) {
    const { t } = React.useContext(LanguageContext)
    const [isIOSSheetOpen, setIOSSheetOpen] = React.useState(false)
    const { setCommentEnabled, setKeyboardVisible, setScrollEnabled } =
        React.useContext(FeedContext)
    const { expand } = React.useContext(BottomSheetContext)

    const container: any = {
        maxWidth: sizes.screens.width,
        borderRadius: sizes.borderRadius["1md"] * 1.2,
        backgroundColor: colors.gray.grey_08,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: sizes.paddings["1md"],
        paddingBottom: isAccount ? sizes.paddings["1sm"] * 0.6 : sizes.paddings["2sm"],
        paddingTop: sizes.paddings["1sm"],
    }

    const buttonContainer: ViewStyle = {
        alignSelf: "center",
        alignItems: "center",
        maxWidth: sizes.buttons.width * 0.7,
        height: sizes.buttons.height * 0.4,
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: colors.gray.white,
    }

    const buttonTitle: any = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body * 1,
        color: colors.gray.black,
    }
    function handlePress() {
        // habilita o input/teclado e abre o modal de comentários
        setCommentEnabled(true)
        setKeyboardVisible(true)
        setScrollEnabled(true)

        if (isIOS) {
            setIOSSheetOpen(true)
        } else {
            expand({
                snapPoints: ["60%"],
                enablePanDownToClose: true,
                children: <FetchedCommentsList />,
            })
        }
    }
    return (
        <View style={container} pointerEvents="box-none">
            <View
                style={{
                    marginBottom: sizes.margins["2sm"],
                    alignItems: "center",
                    alignSelf: "center",
                }}
            >
                {moment.publishedAt && (
                    <Text
                        style={{
                            fontSize: fonts.size.caption1,
                            color: ColorTheme().textDisabled,
                        }}
                    >
                        {t("Shared ")}{" "}
                        {textLib.date.toRelativeTime(new Date(moment.publishedAt)).toLowerCase()}
                    </Text>
                )}
                <Text
                    style={{
                        fontFamily: fonts.family.Bold,
                        paddingTop: isAccount ? sizes.margins["1sm"] : 0,
                        fontSize: fonts.size.subheadline * 0.85,
                    }}
                >
                    {t("It seems like nobody has commented yet")} 🥲
                </Text>
            </View>

            {!isAccount && (
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
                        {t("React to")}{" "}
                        <UserShow.Root data={moment.user}>
                            <View style={{ top: 3 }}>
                                <UserShow.Username
                                    pressable={false}
                                    margin={0}
                                    displayOnMoment={false}
                                    color={colors.gray.black}
                                    fontSize={fonts.size.body}
                                    fontFamily={fonts.family["Black-Italic"]}
                                    truncatedSize={10}
                                />
                            </View>
                        </UserShow.Root>
                    </Text>
                </ButtonStandart>
            )}
        </View>
    )
}
