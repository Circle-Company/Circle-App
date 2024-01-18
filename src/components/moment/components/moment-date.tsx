import React from "react"
import { View, Text, Pressable } from "react-native"

import Sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { MomentDateProps } from "../moment-types"
import { useMomentContext } from "../moment-context"
import { timeDifferenceConverter } from '../../../algorithms/dateConversor'
import sizes from "../../../layout/constants/sizes"
import ClockIcon from '../../../assets/icons/svgs/clock.svg'

export default function date ({
    color = String(ColorTheme().text),
    backgroundColor= String(ColorTheme().backgroundDisabled)
}: MomentDateProps) {
    const { moment } = useMomentContext()

    const container:any = {
        height: sizes.sizes["2md"]*0.9,
        borderRadius: (sizes.sizes["2md"]*0.9)/2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sizes.paddings["2sm"],
        backgroundColor,
        flexDirection: 'row'
    }
    const description_style:any = {
        fontSize: fonts.size.body*0.8,
        fontFamily: fonts.family.Semibold,
        color
    }
    
    return (
        <View style={container}>
            <ClockIcon fill={color} width={16} height={16} style={{marginRight: sizes.margins["1sm"]*1.4}}/>
            <Text style={description_style}>{timeDifferenceConverter({date: String(moment.created_at), small: false})}</Text>  
        </View>
    )
}