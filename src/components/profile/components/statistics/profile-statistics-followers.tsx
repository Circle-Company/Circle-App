import React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import LanguageContext from "../../../../contexts/Preferences/language"
import BottomSheetContext from "../../../../contexts/bottomSheet"
import NumberConversor from "../../../../helpers/numberConversor"
import ColorTheme from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"
import { Text } from "../../../Themed"
import Button from "../../../buttons/button-standart"
import { useProfileContext } from "../../profile-context"
import { UserFollowersModal } from "../view-followers-modal"
export default function statistics_followers() {
    const { user } = useProfileContext()
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

    const container: StyleProp<ViewStyle> = {
        alignItems: "center",
        justifyContent: "center",
        width: sizes.screens.width / 4,
        marginTop: sizes.margins["1sm"],
    }

    const num_style: StyleProp<TextStyle> = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.title2,
        color: ColorTheme().text,
    }
    const text_style: StyleProp<TextStyle> = {
        top: 1,
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.body * 0.8,
        color: ColorTheme().textDisabled,
    }
    return (
        <Button
            margins={false}
            width={sizes.screens.width / 4}
            backgroundColor="#00000000"
            action={handlePress}
            bounciness={5}
            animationScale={0.9}
        >
            <View style={container}>
                <Text style={num_style}>
                    {NumberConversor(user?.statistics?.total_followers_num)}
                </Text>
                <Text style={text_style}>{t("Followers")}</Text>
            </View>
        </Button>
    )
}
