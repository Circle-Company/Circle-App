import { truncated } from "@/helpers/processText"
import React from "react"
import { View, useColorScheme } from "react-native"
import LanguageContext from "../../../../contexts/Preferences/language"
import BottomSheetContext from "../../../../contexts/bottomSheet"
import NumberConversor from "../../../../helpers/numberConversor"
import ColorTheme from "../../../../layout/constants/colors"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"
import { Text } from "../../../Themed"
import Button from "../../../buttons/button-standart"
import { useProfileContext } from "../../profile-context"
import { ProfileStatisticsFollowersProps } from "../../profile-types"
import { UserFollowersModal } from "../view-followers-modal"

export default function statistics_followers({}: ProfileStatisticsFollowersProps) {
    const { user } = useProfileContext()
    const { expand } = React.useContext(BottomSheetContext)
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"

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
                <Text style={num_style}>
                    {NumberConversor(user?.statistics?.total_followers_num)}
                </Text>
                <Text style={text_style}>{truncated({ text: t("Followers"), size: 8 })}</Text>
            </View>
        </Button>
    )
}
