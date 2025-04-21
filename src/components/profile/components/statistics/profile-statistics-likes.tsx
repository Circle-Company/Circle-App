import React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import BottomSheetContext from "../../../../contexts/bottomSheet"
import LanguageContext from "../../../../contexts/Preferences/language"
import NumberConversor from "../../../../helpers/numberConversor"
import ColorTheme from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"
import Button from "../../../buttons/button-standart"
import { Text } from "../../../Themed"
import { useProfileContext } from "../../profile-context"
import LikesRenderModal from "./profile-statistics-likes-modal"

export default function statistics_likes() {
    const { user } = useProfileContext()
    const { t } = React.useContext(LanguageContext)
    const { expand } = React.useContext(BottomSheetContext)

    function handlePress() {
        expand({
            children: <LikesRenderModal user={user} />,
            snapPoints: ["15%"],
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
                <Text style={num_style}>{NumberConversor(user?.statistics?.total_likes_num)}</Text>
                <Text style={text_style}>{t("Likes")}</Text>
            </View>
        </Button>
    )
}
