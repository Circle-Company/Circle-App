import { View } from "react-native";
import { ProfileStatisticsViewsProps } from "../../profile-types";
import { useProfileContext } from "../../profile-context";
import { Text } from "../../../Themed";
import NumberConversor from "../../../../algorithms/numberConversor";
import {StatisticsStyles} from './profile-statistics-styles'
import sizes from "../../../../layout/constants/sizes";
import fonts from "../../../../layout/constants/fonts";
import { useColorScheme } from "react-native";
import ColorTheme, {colors} from "../../../../layout/constants/colors";
import React from "react";
import LanguageContext from "../../../../contexts/Preferences/language";

export default function statistics_views ({}: ProfileStatisticsViewsProps) {
    const {user} = useProfileContext()
    const isDarkMode = useColorScheme() === 'dark'
    const {t} = React.useContext(LanguageContext)

    const container: any = {
        width: sizes.screens.width/4,
        marginTop: sizes.margins["1sm"],
        alignItems: 'center',
        justifyContent: 'center',
    }

    const num_style: any = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.headline,
        color: ColorTheme().text
    }
    const text_style: any = {
        top: 1,
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.body*0.8,
        color: ColorTheme().textDisabled
    }
    return (
        <View style={container}>
            <Text style={num_style}>{ NumberConversor(user.statistics.total_views_num)}</Text>
            <Text style={text_style}>{t('Views')}</Text>
        </View>
    )
} 