import sizes from "@/layout/constants/sizes"
import React from "react"
import { View } from "react-native"
import config from "../../../../config"
import LanguageContext from "../../../../contexts/Preferences/language"
import NumberConversor, { formatNumberWithDots } from "../../../../helpers/numberConversor"
import ColorTheme from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import { Text } from "../../../Themed"
import { ProfileReciveDataProps } from "../../profile-types"

type LikesModelProps = {
    user: ProfileReciveDataProps
}

export default function LikesRenderModal({ user }: LikesModelProps) {
    const { t } = React.useContext(LanguageContext)

    const width =
        sizes.screens.width - (sizes.paddings["2sm"] * 2 + sizes.bottomSheet.marginHorizontal * 2)

    const container = {
        alignItems: "center",
    }
    const NumberStyle = {
        fontSize: fonts.size.title1,
        fontFamily: fonts.family["Semibold-Italic"],
    }
    const DescriptionStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family["Semibold-Italic"],
    }

    const TextStyle = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family["Semibold-Italic"],
        color: ColorTheme().text + "90",
    }
    return (
        <View style={{ width }}>
            <Text style={NumberStyle}>
                {formatNumberWithDots(user?.statistics?.total_likes_num)}
                <Text style={DescriptionStyle}> {t("Likes")}</Text>
            </Text>

            <Text style={TextStyle}>
                {`@${user?.username} ${t("has a total of")} ${NumberConversor(user?.statistics?.total_likes_num)} ${t("likes throughout his time on")} ${config.APPLICATION_NAME}`}
            </Text>
        </View>
    )
}
