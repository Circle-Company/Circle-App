import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../../constants/colors"
import fonts from "../../../../constants/fonts"
import sizes from "../../../../constants/sizes"
import LanguageContext from "../../../../contexts/Preferences/language"
import BottomSheetContext from "../../../../contexts/bottomSheet"
import { formatNumberWithDots } from "../../../../helpers/numberConversor"
import { Vibrate } from "../../../../lib/hooks/useHapticFeedback"
import { Text } from "../../../Themed"
import CancelButton from "../../../buttons/cancel"
import { ProfileReciveDataProps } from "../../profile-types"
import { FollowersList } from "./followers-list"

export type FollowersModalProps = {
    user: ProfileReciveDataProps
}

export function UserFollowersModal({ user }: FollowersModalProps) {
    const { t } = React.useContext(LanguageContext)
    const { collapse } = React.useContext(BottomSheetContext)
    const width =
        sizes.screens.width - (sizes.paddings["2sm"] * 2 + sizes.bottomSheet.marginHorizontal * 2)

    const container: any = {
        width,
    }

    const NumberStyle = {
        fontSize: fonts.size.title2,
        fontFamily: fonts.family["Bold-Italic"],
    }
    const TextStyle = {
        marginTop: sizes.margins["1sm"],
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family["Semibold-Italic"],
        color: ColorTheme().text + "90",
    }

    const headerContainer: any = {
        borderBottomWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        borderColor: ColorTheme().backgroundDisabled,
        paddingBottom: sizes.paddings["2sm"],
    }

    const centerContainer: any = {
        width,
        height: "84%",
    }

    const bottomContainer: any = {
        width,
        borderTopWidth: 1,
        alignSelf: "center",
        borderColor: ColorTheme().backgroundDisabled,
        paddingTop: sizes.paddings["1sm"],
    }

    return (
        <View style={container}>
            <View style={headerContainer}>
                <Text style={NumberStyle}>
                    {formatNumberWithDots(user?.statistics?.total_followers_num)}
                </Text>

                <Text style={TextStyle}>{`${t("users is following")} @${user?.username}`}</Text>
            </View>
            <View style={centerContainer}>
                <FollowersList user={user} />
            </View>
            <View style={bottomContainer}>
                <CancelButton
                    vibrate={() => Vibrate("impactLight")}
                    action={collapse}
                    height={sizes.buttons.height * 0.5}
                    text={t("Close")}
                />
            </View>
        </View>
    )
}
