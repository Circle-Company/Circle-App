import ColorTheme, { colors } from "@/layout/constants/colors"
import { TextStyle, ViewStyle, useColorScheme } from "react-native"

import RadiowavesIcon from "@/assets/icons/svgs/antenna_radiowaves_left_and_right.svg"
import ButtonStandart from "@/components/buttons/button-standart"
import { Loading } from "@/components/loading"
import { Text } from "@/components/Themed"
import NearContext from "@/contexts/near"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"
import { t } from "i18next"
import React from "react"

export function RenderFooter() {
    const { loading, getNearbyUsers, nearbyUsers} = React.useContext(NearContext) || {}
    const isDarkMode = useColorScheme() === "dark"

    const reloadTextStyle: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
        marginRight: sizes.margins["2sm"],
    }

    const buttonStyle: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginTop: sizes.margins["2md"],
    }

    if (nearbyUsers?.length === 0) return null

    return (
        <ButtonStandart
            width={loading ? sizes.screens.width * 0.2 : undefined}
            animationScale={0.8}
            margins={false}
            backgroundColor={isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02}
            action={getNearbyUsers}
            style={buttonStyle}
        >
            {loading ? (
                <Loading.Container width={sizes.screens.width * 0.5} height={40}>
                    <Loading.ActivityIndicator size={20} />
                </Loading.Container>
            ) : (
                <>
                    <Text style={reloadTextStyle}>{t("Fetch Again")}</Text>
                    <RadiowavesIcon
                        fill={isDarkMode ? colors.gray.white : colors.gray.black}
                        width={18}
                        height={18}
                    />
                </>
            )}
        </ButtonStandart>
    )
}
