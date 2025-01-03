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
        width: sizes.screens.width / 4,
        marginTop: sizes.margins["1sm"],
        alignItems: "center",
        justifyContent: "center",
    }

    const num_style: any = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.title2,
        color: ColorTheme().text,
    }
    const text_style: any = {
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
