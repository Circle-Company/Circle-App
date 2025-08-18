import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import ColorTheme from "../../../../constants/colors"
import fonts from "../../../../constants/fonts"
import LanguageContext from "../../../../contexts/Preferences/language"
import BottomSheetContext from "../../../../contexts/bottomSheet"
import NumberConversor from "../../../../helpers/numberConversor"
import { Text } from "../../../Themed"
import Button from "../../../buttons/button-standart"
import { useProfileContext as UseProfileContext } from "../../profile-context"
import { UserFollowersModal } from "../view-followers-modal"

export default function StatisticsFollowers() {
    const { user } = UseProfileContext()
    const { expand } = React.useContext(BottomSheetContext)
    const { t } = React.useContext(LanguageContext)

    function handlePress() {
        expand({
            enablePanDownToClose: false,
            enableHandlePanningGesture: false,
            enableContentPanningGesture: false,
            style: { margin: 0, padding: 0 },
            children: <UserFollowersModal user={user} />,
            snapPoints: ["99%"],
        })
    }

    const container: ViewStyle = {
        alignItems: "center",
    }

    const num_style: TextStyle = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.title3,
        color: ColorTheme().text,
    }
    const text_style: TextStyle = {
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.body * 0.8,
        color: ColorTheme().textDisabled,
    }
    return (
        <Button
            margins={false}
            action={handlePress}
            bounciness={5}
            animationScale={0.9}
            borderRadius={0}
            backgroundColor="#00000000"
        >
            <View style={container}>
                <Text style={num_style}>
                    {NumberConversor(user.statistics.total_followers_num)}
                </Text>
                <Text style={text_style}>{t("Followers")}</Text>
            </View>
        </Button>
    )
}
