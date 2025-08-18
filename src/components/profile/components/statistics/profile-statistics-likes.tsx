import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import ColorTheme from "../../../../constants/colors"
import fonts from "../../../../constants/fonts"
import BottomSheetContext from "../../../../contexts/bottomSheet"
import LanguageContext from "../../../../contexts/Preferences/language"
import NumberConversor from "../../../../helpers/numberConversor"
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
                <Text style={num_style}>{NumberConversor(user.statistics.total_likes_num)}</Text>
                <Text style={text_style}>{t("Likes")}</Text>
            </View>
        </Button>
    )
}
