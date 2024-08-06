import React from "react"
import { View } from "react-native"
import config from "../../../../config"
import LanguageContext from "../../../../contexts/Preferences/language"
import NumberConversor, { formatNumberWithDots } from "../../../../helpers/numberConversor"
import ColorTheme from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import { Text } from "../../../Themed"
import { ProfileReciveDataProps } from "../../profile-types"

type ViewsModelProps = {
    user: ProfileReciveDataProps
}

export default function ViewsRenderModal({ user }: ViewsModelProps) {
    const { t } = React.useContext(LanguageContext)
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
        fontSize: fonts.size.body,
        fontFamily: fonts.family["Semibold-Italic"],
        color: ColorTheme().text + "90",
    }
    return (
        <View>
            <Text style={NumberStyle}>
                {formatNumberWithDots(user?.statistics?.total_views_num)}
                <Text style={DescriptionStyle}> {t("Views")}</Text>
            </Text>

            <Text style={TextStyle}>
                {`@${user?.username} ${t("has a total of")} ${NumberConversor(user?.statistics?.total_views_num)} ${t("views throughout his time on")} ${config.APPLICATION_NAME}`}
            </Text>
        </View>
    )
}
