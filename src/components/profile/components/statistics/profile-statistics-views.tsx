import { truncated } from "@/helpers/processText"
import React from "react"
import { useColorScheme, View } from "react-native"
import BottomSheetContext from "../../../../contexts/bottomSheet"
import LanguageContext from "../../../../contexts/Preferences/language"
import NumberConversor from "../../../../helpers/numberConversor"
import ColorTheme from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"
import Button from "../../../buttons/button-standart"
import { Text } from "../../../Themed"
import { useProfileContext } from "../../profile-context"
import { ProfileStatisticsViewsProps } from "../../profile-types"
import ViewsRenderModal from "./profile-statistics-views-modal"

export default function statistics_views({}: ProfileStatisticsViewsProps) {
    const { user } = useProfileContext()
    const isDarkMode = useColorScheme() === "dark"
    const { expand } = React.useContext(BottomSheetContext)
    const { t } = React.useContext(LanguageContext)

    function handlePress() {
        expand({
            children: <ViewsRenderModal user={user} />,
            snapPoints: ["15%"],
        })
    }

    const container: any = {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    }

    const num_style: any = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.body,
        color: ColorTheme().text,
        marginRight: sizes.margins["1sm"],
    }
    const text_style: any = {
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.body,
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
                <Text style={num_style}>{NumberConversor(user?.statistics?.total_views_num)}</Text>
                <Text style={text_style}>{truncated({ text: t("Views"), size: 8 })}</Text>
            </View>
        </Button>
    )
}
