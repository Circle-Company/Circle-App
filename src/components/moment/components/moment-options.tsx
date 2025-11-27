import ColorTheme, { colors } from "../../../constants/colors"
import { MomentDataReturnsProps, MomentOptionsProps } from "../context/types"
import { View, ViewStyle } from "react-native"

import ButtonStandart from "../../buttons/button-standart"
import LanguageContext from "../../../contexts/Preferences/language"
import React from "react"
import { StatisticsPreview } from "./moment-statistics-preview"
import { Text } from "../../Themed"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"

type OptionsProps = {
    momentData: MomentDataReturnsProps
    momentOptions: MomentOptionsProps
}

export default function Options({ momentData, momentOptions }: OptionsProps) {
    const { t } = React.useContext(LanguageContext)
    const width =
        sizes.screens.width - (sizes.paddings["2sm"] * 2 + sizes.bottomSheet.marginHorizontal * 2)

    const textStyle = {
        color: colors.red.red_05,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
    }

    const descriptionStyle = {
        color: ColorTheme().textDisabled,
        fontSize: fonts.size.body * 0.7,
        fontFamily: fonts.family.Medium,
    }

    const textsContainer: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: sizes.margins["1md"],
    }

    const statisticsText = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        marginBottom: sizes.margins["2sm"],
        marginLeft: sizes.margins["2sm"],
    }

    return (
        <View>
            <View
                style={{
                    paddingBottom: sizes.paddings["1md"],
                    marginBottom: sizes.margins["1md"],
                    borderBottomWidth: 1.5,
                    borderColor: ColorTheme().backgroundDisabled + "99",
                }}
            >
                <Text style={statisticsText}>{t("Statistics")}</Text>
                <StatisticsPreview momentData={momentData} momentOptions={momentOptions} />
            </View>

            <View style={textsContainer}>
                <Text style={descriptionStyle}>
                    {t("The Moment will only be removed from this memory.")}
                </Text>
                <Text style={[descriptionStyle, { fontSize: fonts.size.body * 0.56 }]}>
                    *
                    {t(
                        "If the memory only has this moment and you remove it, the memory will be deleted.",
                    )}
                </Text>
            </View>

            <ButtonStandart
                animationScale={0.9}
                bounciness={5}
                margins={false}
                width={width}
                borderRadius={10}
                height={sizes.buttons.height / 1.5}
                action={() => {}}
            >
                <Text style={textStyle}>{`${t("Delete Moment from")}`}</Text>
            </ButtonStandart>
        </View>
    )
}
