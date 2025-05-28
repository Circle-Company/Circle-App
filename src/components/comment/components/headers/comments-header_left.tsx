import { Text, View } from "react-native"

import ColorTheme from "../../../../layout/constants/colors"
import { CommentsHeaderLeftProps } from "../../comments-types"
import LanguageContext from "../../../../contexts/Preferences/language"
import React from "react"
import Trend from "../../../../assets/icons/svgs/text_bubble.svg"
import fonts from "../../../../layout/constants/fonts"
import sizes from "../../../../layout/constants/sizes"

export default function header_left({}: CommentsHeaderLeftProps) {
    const { t } = React.useContext(LanguageContext)
    const container: any = {
        paddingLeft: sizes.paddings["1sm"] * 0.7,
        flexDirection: "row",
        width: 120,
        borderRadius: 20,
        paddingVertical: 4,
    }
    const text: any = {
        marginLeft: sizes.margins["1sm"] * 1.4,
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
    }

    return (
        <View style={container}>
            <Trend style={{ top: 3 }} fill={String(ColorTheme().text)} width={12} height={12} />
            <Text style={text}>{t("Comments")}</Text>
        </View>
    )
}
