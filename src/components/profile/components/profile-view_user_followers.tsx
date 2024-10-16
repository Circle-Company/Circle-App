import React from "react"
import { View } from "react-native"
import LanguageContext from "../../../contexts/Preferences/language"
import { formatNumberWithDots } from "../../../helpers/numberConversor"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import { Text } from "../../Themed"
import { ProfileReciveDataProps } from "../profile-types"

type FollowersModelProps = {
    user: ProfileReciveDataProps
}

export default function ViewUserFollowersModal({ user }: FollowersModelProps) {
    const { t } = React.useContext(LanguageContext)
    const container: any = {
        alignItems: "center",
    }
    const NumberStyle = {
        fontSize: fonts.size.title1,
        fontFamily: fonts.family["Semibold-Italic"],
    }
    const TextStyle = {
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family["Semibold-Italic"],
        color: ColorTheme().text + "90",
    }

    const headerContainer: any = {
        borderBottomWidth: 1,
        borderColor: ColorTheme().backgroundDisabled,
    }
    return (
        <View style={container}>
            <View style={headerContainer}>
                <Text style={NumberStyle}>
                    {formatNumberWithDots(user?.statistics?.total_followers_num)}
                </Text>

                <Text style={TextStyle}>{`${t("users is following")} @${user?.username}`}</Text>
            </View>
        </View>
    )
}
